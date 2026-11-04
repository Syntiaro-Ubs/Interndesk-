import { Notification } from '../models/index.js';

export const getNotifications = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const where = {};

    if (userEmail) {
      where.userEmail = userEmail.toLowerCase();
    }

    const list = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json(list);
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByPk(id);
    if (notif) {
      notif.isRead = true;
      await notif.save();
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    return res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    if (!userEmail) {
      return res.status(401).json({ error: 'User email required' });
    }

    await Notification.update(
      { isRead: true },
      { where: { userEmail: userEmail.toLowerCase(), isRead: false } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    return res.status(500).json({ error: err.message || 'Failed to mark all notifications as read' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'] || req.body.email || 'support@interndesk.in';
    const notif = await Notification.create({
      userEmail: userEmail.toLowerCase(),
      title: req.body.title || req.body.subject || 'Support Request Logged',
      message: req.body.message || 'Thank you for contacting InternDesk. Our team has received your ticket.',
      type: req.body.type || 'support',
      isRead: false
    });
    req.app?.locals?.emit?.('notification_created', notif.toJSON());
    return res.status(201).json(notif);
  } catch (err) {
    console.error('createNotification error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create notification' });
  }
};
