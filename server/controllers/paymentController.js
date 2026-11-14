import crypto from 'crypto';
import { Payment, User, SystemSetting } from '../models/index.js';

const PAYU_KEY = process.env.PAYU_KEY || 'jQeD5L';
const PAYU_SALT = process.env.PAYU_SALT || 'VOI8kOjdsMlf1enTDLznipWj2dB6MiC5';
const PAYU_PAYMENT_URL = process.env.PAYU_PAYMENT_URL || (process.env.PAYU_ENV === 'production' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment');

let cachedPrice = Number(process.env.RESUME_DOWNLOAD_PRICE_INR) || 99;

export async function initResumePrice() {
  try {
    const setting = await SystemSetting.findByPk('RESUME_DOWNLOAD_PRICE_INR');
    if (setting && setting.value) {
      const val = Number(setting.value);
      if (!isNaN(val) && val > 0) {
        cachedPrice = val;
      }
    }
  } catch (err) {
    // Fallback quietly if DB is not ready yet
  }
}

// Preload on startup
initResumePrice().catch(() => {});

export function getResumePrice() {
  return cachedPrice;
}

export async function setResumePrice(newPrice) {
  const priceNum = Math.max(1, Number(newPrice) || 99);
  cachedPrice = priceNum;
  process.env.RESUME_DOWNLOAD_PRICE_INR = String(priceNum);
  try {
    await SystemSetting.upsert({
      key: 'RESUME_DOWNLOAD_PRICE_INR',
      value: String(priceNum)
    });
  } catch (err) {
    console.error('Error persisting resume price to SystemSetting:', err.message);
  }
  return cachedPrice;
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Generate PayU SHA-512 Hash for checkout
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
function generatePayUHash({ key, txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '', salt }) {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verify PayU response hash
 * Formula (without additionalCharges): sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Formula (with additionalCharges): sha512(additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
function verifyPayUHash(body, salt) {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    key,
    additionalCharges
  } = body;

  let hashString = '';
  if (additionalCharges) {
    hashString = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  return calculatedHash.toLowerCase() === (body.hash || '').toLowerCase();
}

/**
 * Initiate PayU payment order for Resume PDF download
 */
export async function createResumePaymentOrder(req, res) {
  try {
    const { draftId, phone } = req.body;
    if (!draftId) {
      return res.status(400).json({ error: 'draftId is required to start payment.' });
    }

    // Cashfree-style safety: Prevent live real money payments from running on localhost
    const host = req.get('host') || '';
    const origin = req.get('origin') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || origin.includes('localhost') || origin.includes('127.0.0.1');
    if (isLocalhost && process.env.PAYU_ENV === 'production') {
      return res.status(400).json({
        error: 'Payment cannot be processed on localhost with live credentials. Live payment will be processed once the project is live on production domain.'
      });
    }

    // Check if already paid
    const existingPaid = await Payment.findOne({
      where: {
        draftId,
        status: 'SUCCESS'
      }
    });

    if (existingPaid) {
      return res.json({ alreadyPaid: true, draftId });
    }

    const userId = req.session?.user?.id || req.user?.id || null;
    const email = (req.session?.user?.email || req.user?.email || req.body.email || 'student@interndesk.in').trim();
    const rawName = (req.session?.user?.firstName || req.user?.firstName || req.body.name || 'Student');
    const firstname = rawName.replace(/[^a-zA-Z0-9]/g, '') || 'Student';
    const userPhone = (phone || req.session?.user?.phone || req.body.phone || '9999999999').replace(/\D/g, '').slice(0, 10);

    const txnid = `TXN_RES_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const resumePrice = getResumePrice();
    const amount = resumePrice.toFixed(2);
    const productinfo = 'ATS resume PDF download';
    const udf1 = String(draftId);
    const udf2 = userId ? String(userId) : '';
    const surl = `${BACKEND_URL}/api/payments/payu-callback`;
    const furl = `${BACKEND_URL}/api/payments/payu-callback`;

    const hash = generatePayUHash({
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      udf2,
      salt: PAYU_SALT
    });

    // Record pending transaction in DB
    await Payment.create({
      userId,
      userEmail: email,
      userPhone,
      draftId: String(draftId),
      txnid,
      amount: resumePrice,
      currency: 'INR',
      status: 'PENDING',
      productInfo: productinfo
    });

    const paymentUrl = process.env.PAYU_PAYMENT_URL || (process.env.PAYU_ENV === 'production' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment');

    return res.json({
      alreadyPaid: false,
      actionUrl: paymentUrl,
      fields: {
        key: PAYU_KEY,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone: userPhone,
        surl,
        furl,
        hash,
        udf1,
        udf2
      }
    });
  } catch (error) {
    console.error('Error creating resume payment order:', error);
    return res.status(500).json({ error: error.message || 'Could not initiate PayU checkout.' });
  }
}

/**
 * Handle PayU Webhook / Callback POST
 */
export async function handlePayUCallback(req, res) {
  try {
    const body = req.body || {};
    const isValidHash = verifyPayUHash(body, PAYU_SALT);
    const isSuccess = body.status === 'success' && isValidHash;
    const draftId = body.udf1 || '';
    const txnid = body.txnid || '';

    // Update payment record in database
    const payment = await Payment.findOne({ where: { txnid } });
    if (payment) {
      payment.status = isSuccess ? 'SUCCESS' : 'FAILED';
      payment.payuMoneyId = body.mihpayid || null;
      payment.bankRefNum = body.bank_ref_num || null;
      payment.paymentMode = body.mode || null;
      payment.rawResponse = JSON.stringify(body);
      if (isSuccess && !payment.invoiceNumber) {
        payment.invoiceNumber = `INV-${new Date().getFullYear()}-${String(payment.id).padStart(5, '0')}`;
      }
      await payment.save();
    }

    const messageType = isSuccess ? 'PAYU_PAYMENT_SUCCESS' : (body.status === 'pending' ? 'PAYU_PAYMENT_PENDING' : 'PAYU_PAYMENT_FAILED');

    // Return HTML to communicate with the opening window
    return res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Status - InternDesk</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .card {
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 420px;
      width: 90%;
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 24px;
    }
    .icon-success { background: #dcfce7; color: #16a34a; }
    .icon-fail { background: #fee2e2; color: #dc2626; }
    h2 { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 700; }
    p { margin: 0; font-size: 0.875rem; color: #64748b; line-height: 1.5; }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 1.25rem auto 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${isSuccess ? 'icon-success' : 'icon-fail'}">
      ${isSuccess ? '✓' : '✕'}
    </div>
    <h2>${isSuccess ? 'Payment Successful!' : 'Payment Unsuccessful'}</h2>
    <p>${isSuccess ? 'Your ATS resume PDF download has been unlocked.' : (body.error_Message || 'Payment could not be completed. You have not been charged.')}</p>
    <div class="spinner"></div>
    <p style="margin-top: 0.75rem; font-size: 0.75rem; color: #94a3b8;">Closing window...</p>
  </div>
  <script>
    (function() {
      var data = {
        type: "${messageType}",
        draftId: "${draftId}",
        txnid: "${txnid}",
        status: "${body.status || ''}"
      };
      if (window.opener) {
        window.opener.postMessage(data, "*");
        setTimeout(function() { window.close(); }, 1200);
      } else {
        setTimeout(function() { window.location.href = "${FRONTEND_URL}/resume-builder"; }, 2000);
      }
    })();
  </script>
</body>
</html>
    `);
  } catch (error) {
    console.error('Error handling PayU callback:', error);
    return res.status(500).send('An unexpected error occurred processing your payment.');
  }
}

/**
 * Check if a resume draft is paid/unlocked
 */
export async function checkResumeEntitlement(req, res) {
  try {
    const { draftId } = req.params;
    if (!draftId) {
      return res.status(400).json({ error: 'draftId is required.' });
    }

    const payment = await Payment.findOne({
      where: {
        draftId: String(draftId),
        status: 'SUCCESS'
      },
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      paid: Boolean(payment),
      draftId,
      invoiceNumber: payment?.invoiceNumber || null,
      paidAt: payment?.updatedAt || null,
      amount: payment?.amount || null
    });
  } catch (error) {
    console.error('Error checking resume entitlement:', error);
    return res.status(500).json({ error: 'Could not check payment status.' });
  }
}

/**
 * Authorize resume download endpoint
 */
export async function authorizeResumeDownload(req, res) {
  try {
    const { draftId } = req.params;
    if (!draftId) {
      return res.status(400).json({ error: 'draftId is required.' });
    }

    const payment = await Payment.findOne({
      where: {
        draftId: String(draftId),
        status: 'SUCCESS'
      }
    });

    return res.json({
      authorized: Boolean(payment),
      draftId
    });
  } catch (error) {
    console.error('Error authorizing resume download:', error);
    return res.status(500).json({ error: 'Could not authorize download.' });
  }
}

/**
 * Get current student's payment history
 */
export async function getMyPayments(req, res) {
  try {
    const userId = req.session?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Only show successful payments to the student
    const payments = await Payment.findAll({
      where: { userId, status: 'SUCCESS' },
      order: [['createdAt', 'DESC']]
    });

    return res.json(payments);
  } catch (error) {
    console.error('Error fetching my payments:', error);
    return res.status(500).json({ error: 'Could not fetch payments history.' });
  }
}

/**
 * Admin: Get successful payments and revenue statistics
 * Excludes pending/dropped-off checkouts so only actual paid students appear.
 */
export async function getAdminPayments(req, res) {
  try {
    const payments = await Payment.findAll({
      where: {
        status: 'SUCCESS'
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const successCount = payments.length;
    const currentPlanPrice = getResumePrice();

    return res.json({
      payments,
      stats: {
        totalRevenue,
        successCount,
        failedCount: 0,
        totalTransactions: successCount,
        currentPlanPrice
      }
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return res.status(500).json({ error: 'Could not load admin payments.' });
  }
}

/**
 * Admin: Update ATS resume plan fee live
 */
export async function updateAdminResumePrice(req, res) {
  try {
    const rawPrice = req.body?.price;
    const priceNum = Number(rawPrice);
    if (!rawPrice || isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Please enter a valid price in INR (minimum ₹1).' });
    }

    const updatedPrice = await setResumePrice(priceNum);

    return res.json({
      success: true,
      price: updatedPrice,
      message: `ATS Resume Plan Fee successfully updated to ₹${updatedPrice.toFixed(2)}.`
    });
  } catch (error) {
    console.error('Error updating ATS resume plan fee:', error);
    return res.status(500).json({ error: 'Could not update ATS resume plan fee.' });
  }
}


