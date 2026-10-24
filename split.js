const fs = require('fs');
const content = fs.readFileSync('src/app/App.tsx', 'utf8');
const lines = content.split('\n');

function extractLines(startPattern, endPattern, includeEnd = false) {
  const startIdx = lines.findIndex(l => l.includes(startPattern));
  if (startIdx === -1) return '';
  let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(endPattern));
  if (endIdx === -1) endIdx = lines.length;
  return lines.slice(startIdx, includeEnd ? endIdx + 1 : endIdx).join('\n');
}

const types = extractLines('// ─── Types', '// ─── Data');
const data = extractLines('// ─── Data', '// ─── UI Atoms');
const uiAtoms = extractLines('// ─── UI Atoms', '// ─── Internship Card');
const internshipCard = extractLines('// ─── Internship Card', '// ─── Company Card');
const companyCard = extractLines('// ─── Company Card', '// ─── Navbar');
const navbar = extractLines('// ─── Navbar', '// ─── Mobile Header');
const mobileHeader = extractLines('// ─── Mobile Header', '// ─── BottomNav');
const bottomNav = extractLines('// ─── BottomNav', '// ─── Footer');
const footer = extractLines('// ─── Footer', '// ─── Landing Page');
const landingPage = extractLines('// ─── Landing Page', '// ─── Search Page');
const searchPage = extractLines('// ─── Search Page', '// ─── Details Page');
const detailsPage = extractLines('// ─── Details Page', '// ─── Student Home');
const studentHome = extractLines('// ─── Student Home', '// ─── Student Profile');
const studentProfile = extractLines('// ─── Student Profile', '// ─── Applications Page');
const applicationsPage = extractLines('// ─── Applications Page', '// ─── Company Portal');
const companyPortal = extractLines('// ─── Company Portal', '// ─── Career Resources');
const careerResources = extractLines('// ─── Career Resources', '// ─── App');
const appFile = extractLines('// ─── App', 'IMPOSSIBLE_PATTERN', true);

// Types
fs.writeFileSync('src/app/types/index.ts', `export ${types.replace(/type /g, 'export type ').replace(/interface /g, 'export interface ')}`);

// Data
fs.writeFileSync('src/app/data/index.ts', `import { Internship, Company } from '../types';
import { TrendingUp, DollarSign, Users, Target, BarChart3, PieChart, Monitor, LayoutDashboard, Code, Database, Layers, PenTool, Shield, Cloud, Zap, GitBranch } from 'lucide-react';

${data.replace(/const /g, 'export const ')}`);

// App needs icons, let's just add common imports to each
const getImports = (str) => {
  const icons = ['Search', 'MapPin', 'Briefcase', 'Building2', 'Users', 'TrendingUp', 'Star', 'Clock', 'ChevronDown', 'Bell', 'User', 'ArrowRight', 'Share2', 'CheckCircle', 'Calendar', 'Upload', 'Github', 'BarChart3', 'FileText', 'MessageSquare', 'Settings', 'Home', 'ChevronRight', 'DollarSign', 'Award', 'Bookmark', 'GraduationCap', 'Code', 'Database', 'Cloud', 'Shield', 'Monitor', 'Plus', 'Edit', 'Eye', 'Target', 'Zap', 'Check', 'Mail', 'Globe', 'Download', 'Layers', 'LayoutDashboard', 'BookOpen', 'LogOut', 'Linkedin', 'PenTool', 'GitBranch', 'Phone', 'PieChart', 'AlertCircle', 'Menu', 'X'].filter(i => str.includes(i));
  let res = `import React, { useState, useEffect } from 'react';\n`;
  if (icons.length) res += `import { ${icons.join(', ')} } from 'lucide-react';\n`;
  res += `import { View, UserRole, PortalSection, Internship, Company } from '../types';\n`;
  return res;
};

// ... Wait, parsing and fixing imports via script might be very error prone. I will do it manually with bash tools or just let the user know I've done the basic skeleton and they might need to fix imports.
// Actually, let's write out the files with a generic import.

const genericImports = `import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { View, UserRole, PortalSection, Internship, Company } from '../../types';
import { INTERNSHIPS, COMPANIES, MBA_CATEGORIES, IT_CATEGORIES } from '../../data';
`;

// Helper to replace Icons.X
const replaceIcons = (str) => {
  // It's easier to just import all icons we use from lucide-react.
  return `import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Building2, Users, TrendingUp, Star, Clock, ChevronDown, Bell, User, ArrowRight, Share2, CheckCircle, Calendar, Upload, Github, BarChart3, FileText, MessageSquare, Settings, Home, ChevronRight, DollarSign, Award, Bookmark, GraduationCap, Code, Database, Cloud, Shield, Monitor, Plus, Edit, Eye, Target, Zap, Check, Mail, Globe, Download, Layers, LayoutDashboard, BookOpen, LogOut, Linkedin, PenTool, GitBranch, Phone, PieChart, AlertCircle, Menu, X } from 'lucide-react';
`;
}

// I'll run a more robust script
