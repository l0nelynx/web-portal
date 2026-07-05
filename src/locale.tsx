import React, { createContext, useContext, useState } from "react";

export type Lang = "en" | "ru";

const STORAGE_KEY = "web_lang";

function savedLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ru" || v === "en") return v;
  } catch {}
  // Fall back to browser language
  try {
    const nav = navigator.language || "";
    if (nav.toLowerCase().startsWith("ru")) return "ru";
  } catch {}
  return "en";
}

export interface Translations {
  lang_toggle: string;
  // Sidebar / header
  menu_subscription: string;
  menu_buy: string;
  menu_devices: string;
  menu_settings: string;
  btn_logout: string;
  header_portal: string;
  // Landing — nav
  nav_solutions: string;
  nav_platform: string;
  nav_individuals: string;
  nav_business: string;
  // Landing — hero
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_desc: string;
  btn_get_started: string;
  // Landing — stats
  stat_uptime: string;
  stat_nodes: string;
  stat_throughput: string;
  stat_support: string;
  // Landing — features
  features_title: string;
  features_subtitle: string;
  feat_zero_trust_title: string;
  feat_zero_trust_desc: string;
  feat_global_title: string;
  feat_global_desc: string;
  feat_team_title: string;
  feat_team_desc: string;
  feat_throughput_title: string;
  feat_throughput_desc: string;
  feat_compliance_title: string;
  feat_compliance_desc: string;
  feat_deploy_title: string;
  feat_deploy_desc: string;
  feat_infra_title: string;
  feat_infra_desc: string;
  feat_audience_title: string;
  feat_audience_desc: string;
  feat_apps_title: string;
  feat_apps_desc: string;
  // Landing — apps comparison section
  apps_title: string;
  apps_subtitle: string;
  apps_clash_badge: string;
  apps_clash_title: string;
  apps_clash_desc: string;
  apps_clash_protocols_label: string;
  apps_clash_cta: string;
  apps_cheezy_badge: string;
  apps_cheezy_title: string;
  apps_cheezy_desc: string;
  apps_cheezy_cta: string;
  apps_trial_badge: string;
  apps_compare_feature: string;
  apps_row_import: string;
  apps_row_thirdparty: string;
  apps_row_trial: string;
  apps_row_manage: string;
  apps_row_opensource: string;
  // Landing — CTA + footer
  cta_title: string;
  cta_desc: string;
  btn_create_account: string;
  footer_rights: string;
  footer_tagline: string;
  // Login page
  login_title: string;
  login_subtitle: string;
  btn_login: string;
  no_account: string;
  btn_register: string;
  login_invite_hint: string;
  err_invalid_login: string;
  err_banned: string;
  err_login: string;
  btn_tg_login: string;
  err_tg_login: string;
  err_tg_not_registered: string;
  // Verify email page
  verify_title: string;
  verify_send_to: string;
  verify_confirm_fallback: string;
  btn_send_code: string;
  verify_sent_hint: string;
  verify_code_label: string;
  val_code_req: string;
  val_code_len: string;
  btn_confirm: string;
  btn_resend: string;
  verify_success_title: string;
  verify_success_text: string;
  err_verify: string;
  err_code_invalid: string;
  err_code_expired: string;
  // Register
  reg_title: string;
  reg_subtitle: string;
  invite_label: string;
  invite_placeholder: string;
  invite_checking: string;
  invite_invalid: string;
  invite_valid: string;
  discount_accepted: string;
  discount_text: (pct: number) => string;
  pwd_label: string;
  pwd_placeholder: string;
  confirm_label: string;
  confirm_placeholder: string;
  btn_create: string;
  have_account: string;
  sign_in: string;
  err_email_taken: string;
  err_invalid_invite: string;
  err_rate_limited: string;
  err_req_invite: string;
  err_reg: string;
  err_network: string;
  val_email_req: string;
  val_email_format: string;
  val_pwd_req: string;
  val_pwd_min: string;
  val_confirm_req: string;
  val_confirm_match: string;
  val_invite_req: string;
  // Subscription tab
  sub_title: string;
  btn_refresh: string;
  no_sub_title: string;
  no_sub_text: string;
  btn_buy_sub: string;
  err_load_sub: string;
  label_plan: string;
  label_status: string;
  label_days_left: string;
  label_expires: string;
  label_devices: string;
  label_traffic: string;
  traffic_unlimited: string;
  traffic_usage: string;
  copy_sub_link: string;
  status_active: string;
  status_expired: string;
  status_disabled: string;
  status_limited: string;
  // Buy tab
  buy_title: string;
  promo_active: string;
  promo_applied: (pct: number) => string;
  no_tariffs: string;
  btn_pay: string;
  err_load_plans: string;
  invoice_title: string;
  to_pay: string;
  without_discount: string;
  btn_proceed: string;
  err_rate_limited_inv: string;
  err_provider: string;
  err_not_verified: string;
  err_invoice: string;
  btn_back: string;
  discount_applied_msg: (pct: number) => string;
  days: (n: number) => string;
  // Devices tab
  dev_title: string;
  err_load_dev: string;
  err_remove_dev: string;
  err_rate_limited_dev: string;
  col_device: string;
  col_platform: string;
  col_added: string;
  unknown_device: string;
  no_devices: string;
  dev_auto_registered: string;
  confirm_remove: string;
  confirm_remove_desc: string;
  ok_remove: string;
  cancel: string;
  // Settings tab
  settings_title: string;
  card_account: string;
  card_password: string;
  card_security: string;
  label_email_status: string;
  label_telegram: string;
  status_verified: string;
  status_not_verified: string;
  btn_verify: string;
  tg_linked: string;
  tg_not_linked: string;
  pwd_current: string;
  pwd_new: string;
  pwd_confirm_field: string;
  val_pwd_current_req: string;
  val_pwd_new_req: string;
  val_pwd_new_min: string;
  val_pwd_confirm_req: string;
  val_pwd_confirm_match: string;
  btn_change_pwd: string;
  btn_revoke_sessions: string;
  btn_logout_settings: string;
  confirm_revoke_title: string;
  confirm_revoke_content: string;
  ok_revoke: string;
  revoke_security_note: string;
  err_wrong_pwd: string;
  err_rate_limited_pwd: string;
  msg_pwd_changed: string;
  msg_sessions_revoked: string;
  err_revoke_sessions: string;
  msg_code_sent: string;
  err_send_code: string;
  err_change_pwd: string;
  // Credential setup (Telegram-only users)
  card_setup_email: string;
  setup_email_hint: string;
  setup_email_label: string;
  setup_pwd_new_label: string;
  setup_pwd_confirm_label: string;
  btn_setup_send_code: string;
  setup_code_sent_hint: (email: string) => string;
  setup_code_label: string;
  btn_setup_confirm: string;
  setup_success_email: string;
  card_setup_password: string;
  setup_password_hint: (email: string) => string;
  btn_setup_pwd_send_code: string;
  setup_pwd_code_sent_hint: string;
  setup_success_password: string;
  err_email_already_set: string;
  err_password_already_set: string;
  err_setup_email: string;
  err_setup_password: string;
  // Telegram link
  btn_link_telegram: string;
  btn_unlink_telegram: string;
  tg_link_opened: string;
  err_tg_link: string;
  err_tg_unlink: string;
  confirm_unlink_tg: string;
  confirm_unlink_tg_body: string;
  // Promo codes (Settings tab)
  menu_support: string;
  promo_title: string;
  promo_active_label: string;
  promo_code_placeholder: string;
  promo_cant_activate: string;
  btn_activate_promo: string;
  err_promo_invalid: string;
  err_promo_own: string;
  err_promo_already_used: string;
  err_promo_active_exists: string;
  err_promo_referral_only_one: string;
  err_promo_referral_not_new: string;
  err_promo_activate: string;
  msg_promo_activated: (pct: number) => string;
  // Support tickets tab
  support_title: string;
  btn_new_ticket: string;
  ticket_list_empty: string;
  ticket_subject_label: string;
  ticket_subject_placeholder: string;
  ticket_message_label: string;
  ticket_message_placeholder: string;
  btn_send_ticket: string;
  err_create_ticket: string;
  err_load_tickets: string;
  err_load_ticket: string;
  err_send_reply: string;
  err_too_many_tickets: string;
  ticket_status_open: string;
  ticket_status_in_progress: string;
  ticket_status_closed: string;
  reply_placeholder: string;
  btn_send_reply: string;
  val_subject_req: string;
  val_message_req: string;
  btn_back_to_tickets: string;
  lbl_you: string;
  lbl_support_agent: string;
  btn_attach_image: string;
  err_too_many_images: string;
  err_image_too_large: string;
  err_unsupported_image_type: string;
  val_attachment_limit: string;
  // Landing — individuals section
  ind_badge: string;
  ind_title: string;
  ind_desc: string;
  ind_cta: string;
  // Landing — business / partnership section
  biz_badge: string;
  biz_title: string;
  biz_desc: string;
  // Partnership form
  partner_goal_label: string;
  partner_goal_ph: string;
  partner_desc_label: string;
  partner_desc_ph: string;
  partner_contact_label: string;
  partner_contact_ph: string;
  partner_submit: string;
  partner_success: string;
  partner_error: string;
  val_partner_goal: string;
  val_partner_desc: string;
  val_partner_contact: string;
  // Footer + legal
  footer_disclaimer: string;
  footer_legal_heading: string;
  footer_policy: string;
  footer_agreement: string;
  footer_offer: string;
  footer_telegram: string;
  legal_back: string;
}

const en: Translations = {
  lang_toggle: "RU",
  menu_subscription: "Subscription",
  menu_buy: "Buy",
  menu_devices: "Devices",
  menu_settings: "Settings",
  btn_logout: "Sign Out",
  header_portal: "Client Portal",
  // Landing — nav
  nav_solutions: "Solutions",
  nav_platform: "Platform",
  nav_individuals: "For Individuals",
  nav_business: "For Business",
  // Landing — hero
  hero_badge: "Private VPN · Secure by design",
  hero_title_1: "Private, Secure",
  hero_title_2: "VPN Access",
  hero_desc: "Fast, encrypted VPN that keeps your connection private on any network — for individuals and businesses alike. No activity logs, no tracking, no fuss.",
  btn_get_started: "Get Started",
  // Landing — stats
  stat_uptime: "Uptime SLA",
  stat_nodes: "Network Nodes",
  stat_throughput: "Peak Throughput",
  stat_support: "Support",
  // Landing — features
  features_title: "Built for privacy and speed",
  features_subtitle: "Everything you need for a private, reliable connection — nothing you don't.",
  feat_zero_trust_title: "No-Logs Privacy",
  feat_zero_trust_desc: "We don't record your browsing, traffic or IP address. What you do online stays yours.",
  feat_global_title: "Global Network",
  feat_global_desc: "High-availability servers across multiple regions for low-latency, reliable connections wherever you are.",
  feat_team_title: "For You or Your Team",
  feat_team_desc: "Use it solo for everyday privacy, or roll out secure access across your whole organisation.",
  feat_throughput_title: "High Speed",
  feat_throughput_desc: "Optimised routing delivers fast, high-bandwidth connections for streaming, calls and work.",
  feat_compliance_title: "Strong Encryption",
  feat_compliance_desc: "Modern encryption protocols protect every connection end to end.",
  feat_deploy_title: "Instant Setup",
  feat_deploy_desc: "Connect in minutes. Cross-platform clients for Windows, macOS, Linux, iOS and Android.",
  feat_infra_title: "Geographically Distributed Infrastructure",
  feat_infra_desc: "Servers spread across multiple regions so you connect to the nearest, fastest node — wherever you are.",
  feat_audience_title: "For Individuals and Companies",
  feat_audience_desc: "We provide VPN access both to individual users and to companies that need secure connectivity for their teams.",
  feat_apps_title: "Two Apps Built by Us",
  feat_apps_desc: "An open-source universal client for any provider, and a dedicated app tailored to CheezyVPN. See the comparison below.",
  // Landing — apps comparison section
  apps_title: "Choose Your App",
  apps_subtitle: "One is a universal open-source client. The other is built specifically for CheezyVPN — pick what fits you.",
  apps_clash_badge: "Open Source",
  apps_clash_title: "CheezyClash",
  apps_clash_desc: "An Android proxy client supporting VLESS, VMess, Trojan, Shadowsocks, Hysteria 2, WireGuard and more. Rule-based routing, Reality fingerprinting, built natively in Kotlin — works with any compatible service, not just ours.",
  apps_clash_protocols_label: "Supported protocols",
  apps_clash_cta: "Download",
  apps_cheezy_badge: "Made for CheezyVPN",
  apps_cheezy_title: "CheezyVPN",
  apps_cheezy_desc: "Our own app, built specifically for this service. No configs to import — register in the app and get a free trial instantly, then manage your subscription right from your phone.",
  apps_cheezy_cta: "Start free — 14 days",
  apps_trial_badge: "14 days free",
  apps_compare_feature: "Feature",
  apps_row_import: "Manual config import required",
  apps_row_thirdparty: "Works with third-party providers",
  apps_row_trial: "Free trial on sign-up",
  apps_row_manage: "Manage subscription in-app",
  apps_row_opensource: "Open source",
  // Landing — CTA + footer
  cta_title: "Ready to connect your team?",
  cta_desc: "Access requires an invitation code from an existing client or partner.",
  btn_create_account: "Create Account",
  footer_rights: "All rights reserved.",
  footer_tagline: "Secure · Private · Reliable",
  // Login page
  login_title: "Sign In",
  login_subtitle: "Welcome back",
  btn_login: "Sign In",
  no_account: "Don't have an account?",
  btn_register: "Register",
  login_invite_hint: "Registration is by invitation code only",
  err_invalid_login: "Invalid email or password",
  err_banned: "Account is suspended",
  err_login: "Sign in failed. Please try again.",
  btn_tg_login: "Sign in with Telegram",
  err_tg_login: "Telegram login failed. Please try again.",
  err_tg_not_registered: "No account linked to this Telegram. Please register first.",
  // Verify email page
  verify_title: "Email Verification",
  verify_send_to: "We'll send a confirmation code to",
  verify_confirm_fallback: "Please verify your email address",
  btn_send_code: "Send Code",
  verify_sent_hint: "Code sent. Check your inbox (including Spam).",
  verify_code_label: "Confirmation code (6 digits)",
  val_code_req: "Enter the code",
  val_code_len: "Code must be 6 digits",
  btn_confirm: "Confirm",
  btn_resend: "Resend",
  verify_success_title: "Email confirmed!",
  verify_success_text: "Redirecting to your account…",
  err_verify: "Verification failed",
  err_code_invalid: "Invalid or expired code",
  err_code_expired: "Code expired. Request a new one.",
  // Register
  reg_title: "Create Account",
  reg_subtitle: "An invitation code is required to register",
  invite_label: "Invitation Code",
  invite_placeholder: "e.g. ABCD1234",
  invite_checking: "Checking code…",
  invite_invalid: "Invalid code",
  invite_valid: "Code accepted",
  discount_accepted: "Code accepted!",
  discount_text: (pct) => `${pct}% discount on first payment`,
  pwd_label: "Password",
  pwd_placeholder: "At least 8 characters",
  confirm_label: "Confirm Password",
  confirm_placeholder: "Repeat your password",
  btn_create: "Create Account",
  have_account: "Already have an account?",
  sign_in: "Sign in",
  err_email_taken: "This email is already registered",
  err_invalid_invite: "Invalid invitation code",
  err_rate_limited: "Too many attempts. Please wait",
  err_req_invite: "Enter a valid invitation code",
  err_reg: "Registration failed. Please try again.",
  err_network: "Network error. Check your connection.",
  val_email_req: "Enter your email",
  val_email_format: "Invalid email address",
  val_pwd_req: "Enter a password",
  val_pwd_min: "At least 8 characters",
  val_confirm_req: "Repeat your password",
  val_confirm_match: "Passwords do not match",
  val_invite_req: "Enter your invitation code",
  sub_title: "My Subscription",
  btn_refresh: "Refresh",
  no_sub_title: "No active subscription",
  no_sub_text: "Choose a plan to get started",
  btn_buy_sub: "Buy Subscription",
  err_load_sub: "Failed to load subscription data",
  label_plan: "Plan",
  label_status: "Status",
  label_days_left: "Days left",
  label_expires: "Expires",
  label_devices: "Devices",
  label_traffic: "Traffic",
  traffic_unlimited: "Unlimited traffic",
  traffic_usage: "Traffic usage",
  copy_sub_link: "How to connect",
  status_active: "Active",
  status_expired: "Expired",
  status_disabled: "Disabled",
  status_limited: "Limited",
  buy_title: "Buy Subscription",
  promo_active: "Promo code active:",
  promo_applied: (pct) => `${pct}% discount applied to prices`,
  no_tariffs: "No plans configured",
  btn_pay: "Pay",
  err_load_plans: "Failed to load plans. Try again.",
  invoice_title: "Payment Invoice",
  to_pay: "To pay:",
  without_discount: "Without discount:",
  btn_proceed: "Proceed to Payment",
  err_rate_limited_inv: "Too many requests",
  err_provider: "Payment provider unavailable",
  err_not_verified: "Please verify your email first",
  err_invoice: "Failed to create invoice. Try again.",
  btn_back: "Back",
  discount_applied_msg: (pct) => `${pct}% discount applied`,
  days: (n) => `${n} day${n !== 1 ? "s" : ""}`,
  dev_title: "Devices",
  err_load_dev: "Failed to load devices",
  err_remove_dev: "Failed to remove device",
  err_rate_limited_dev: "Too many requests",
  col_device: "Device",
  col_platform: "Platform",
  col_added: "Added",
  unknown_device: "Unknown device",
  no_devices: "No connected devices",
  dev_auto_registered: "Devices are registered automatically when using the client app.",
  confirm_remove: "Remove device?",
  confirm_remove_desc: "This will disconnect the device from VPN",
  ok_remove: "Remove",
  cancel: "Cancel",
  settings_title: "Account Settings",
  card_account: "Account",
  card_password: "Change Password",
  card_security: "Security",
  label_email_status: "Email status",
  label_telegram: "Telegram",
  status_verified: "Verified",
  status_not_verified: "Not verified",
  btn_verify: "Verify",
  tg_linked: "Linked",
  tg_not_linked: "Not linked",
  pwd_current: "Current password",
  pwd_new: "New password",
  pwd_confirm_field: "Confirm password",
  val_pwd_current_req: "Enter your current password",
  val_pwd_new_req: "Enter a new password",
  val_pwd_new_min: "At least 8 characters",
  val_pwd_confirm_req: "Repeat your password",
  val_pwd_confirm_match: "Passwords do not match",
  btn_change_pwd: "Change Password",
  btn_revoke_sessions: "Sign Out All Devices",
  btn_logout_settings: "Sign Out",
  confirm_revoke_title: "Sign out all sessions?",
  confirm_revoke_content: "All devices will be signed out and re-login will be required.",
  ok_revoke: "Sign Out All",
  revoke_security_note: '"Sign Out All Devices" revokes all refresh tokens and signs out on all devices.',
  err_wrong_pwd: "Incorrect current password",
  err_rate_limited_pwd: "Too many attempts",
  msg_pwd_changed: "Password changed. Please sign in again.",
  msg_sessions_revoked: "All sessions signed out",
  err_revoke_sessions: "Failed to sign out sessions",
  msg_code_sent: "Code sent to your email",
  err_send_code: "Failed to send code",
  err_change_pwd: "Failed to change password",
  // Credential setup
  card_setup_email: "Set Up Email & Password",
  setup_email_hint: "Add email login to your account. A verification code will be sent to the address you enter.",
  setup_email_label: "Email",
  setup_pwd_new_label: "Password",
  setup_pwd_confirm_label: "Confirm Password",
  btn_setup_send_code: "Send Verification Code",
  setup_code_sent_hint: (email) => `A 6-digit code was sent to ${email}. Check your inbox (including Spam).`,
  setup_code_label: "Verification code (6 digits)",
  btn_setup_confirm: "Confirm & Save",
  setup_success_email: "Email and password set successfully!",
  card_setup_password: "Set Password",
  setup_password_hint: (email) => `Your account has email (${email}) but no password. To set one, confirm your email with a code.`,
  btn_setup_pwd_send_code: "Send Code to Email",
  setup_pwd_code_sent_hint: "Code sent. Enter it below along with your new password.",
  setup_success_password: "Password set successfully!",
  err_email_already_set: "Email is already set on this account",
  err_password_already_set: "Password is already set on this account",
  err_setup_email: "Failed to set email. Please try again.",
  err_setup_password: "Failed to set password. Please try again.",
  btn_link_telegram: "Link Telegram",
  btn_unlink_telegram: "Unlink",
  tg_link_opened: "Telegram link opened — click Start in the bot, then refresh this page",
  err_tg_link: "Failed to generate Telegram link",
  err_tg_unlink: "Failed to unlink Telegram",
  confirm_unlink_tg: "Unlink Telegram?",
  confirm_unlink_tg_body: "Your Telegram account will be disconnected. You can re-link it later.",
  // Promo codes
  menu_support: "Support",
  promo_title: "Promo Code",
  promo_active_label: "Active promo:",
  promo_code_placeholder: "Enter promo code",
  promo_cant_activate: "Promo is active — will apply to your next payment.",
  btn_activate_promo: "Activate",
  err_promo_invalid: "Invalid promo code",
  err_promo_own: "Cannot use your own promo code",
  err_promo_already_used: "You have already used this promo code",
  err_promo_active_exists: "A promo is already active — use it first",
  err_promo_referral_only_one: "You have already used a referral code",
  err_promo_referral_not_new: "Referral codes are for new users only",
  err_promo_activate: "Failed to activate promo code",
  msg_promo_activated: (pct) => `Promo activated — ${pct}% discount applied`,
  // Support tickets
  support_title: "Support",
  btn_new_ticket: "New Ticket",
  ticket_list_empty: "No support tickets yet",
  ticket_subject_label: "Subject",
  ticket_subject_placeholder: "Brief description of the issue",
  ticket_message_label: "Message",
  ticket_message_placeholder: "Describe your issue in detail…",
  btn_send_ticket: "Submit",
  err_create_ticket: "Failed to create ticket",
  err_load_tickets: "Failed to load tickets",
  err_load_ticket: "Failed to load ticket",
  err_send_reply: "Failed to send reply",
  err_too_many_tickets: "Too many open tickets. Close some first.",
  ticket_status_open: "Open",
  ticket_status_in_progress: "In Progress",
  ticket_status_closed: "Closed",
  reply_placeholder: "Type your reply…",
  btn_send_reply: "Send",
  val_subject_req: "Enter a subject",
  val_message_req: "Enter a message",
  btn_back_to_tickets: "Back to tickets",
  lbl_you: "You",
  lbl_support_agent: "Support",
  btn_attach_image: "Attach image",
  err_too_many_images: "Up to 3 images per message",
  err_image_too_large: "File too large (max 5MB)",
  err_unsupported_image_type: "Unsupported image type",
  val_attachment_limit: "Up to 3 images, 5MB each",
  // Landing — individuals section
  ind_badge: "For individuals",
  ind_title: "Your privacy, in one tap",
  ind_desc: "Encrypted, high-speed access that keeps your connection private on any network. No activity logs, no tracking — just a secure tunnel for everyday browsing. Start free in Telegram, no card required.",
  ind_cta: "Try free in Telegram",
  // Landing — business / partnership section
  biz_badge: "For business",
  biz_title: "Partner with us",
  biz_desc: "Looking to offer private connectivity to your team, resell access, or integrate our infrastructure? Tell us your goal and we'll get back to you.",
  // Partnership form
  partner_goal_label: "Goal",
  partner_goal_ph: "e.g. reseller partnership, team access, integration",
  partner_desc_label: "Description",
  partner_desc_ph: "Tell us more about what you're looking for…",
  partner_contact_label: "Contact",
  partner_contact_ph: "Telegram, email or any way to reach you",
  partner_submit: "Send inquiry",
  partner_success: "Thanks! Your inquiry has been sent — we'll be in touch.",
  partner_error: "Couldn't send your inquiry. Please try again later.",
  val_partner_goal: "Please enter your goal",
  val_partner_desc: "Please add a short description",
  val_partner_contact: "Please leave a way to contact you",
  // Footer + legal
  footer_disclaimer: "This service is not intended for circumventing lawful restrictions.",
  footer_legal_heading: "Legal",
  footer_policy: "Privacy Policy",
  footer_agreement: "User Agreement",
  footer_offer: "Public Offer",
  footer_telegram: "Telegram",
  legal_back: "← Back to home",
};

const ru: Translations = {
  lang_toggle: "EN",
  menu_subscription: "Подписка",
  menu_buy: "Купить",
  menu_devices: "Устройства",
  menu_settings: "Настройки",
  btn_logout: "Выйти",
  header_portal: "Клиентский портал",
  // Landing — nav
  nav_solutions: "Возможности",
  nav_platform: "Платформа",
  nav_individuals: "Частным лицам",
  nav_business: "Бизнесу",
  // Landing — hero
  hero_badge: "Приватный VPN · Безопасность в основе",
  hero_title_1: "Приватный и безопасный",
  hero_title_2: "VPN-доступ",
  hero_desc: "Быстрый зашифрованный VPN, который сохраняет ваше подключение приватным в любой сети — для частных лиц и бизнеса. Без логов активности и слежки.",
  btn_get_started: "Начать",
  // Landing — stats
  stat_uptime: "Гарантия работы",
  stat_nodes: "Серверов",
  stat_throughput: "Пиковая скорость",
  stat_support: "Поддержка",
  // Landing — features
  features_title: "Создан для приватности и скорости",
  features_subtitle: "Всё необходимое для приватного и надёжного подключения — и ничего лишнего.",
  feat_zero_trust_title: "Приватность без логов",
  feat_zero_trust_desc: "Мы не храним историю посещений, трафик и IP-адрес. То, что вы делаете онлайн, остаётся вашим.",
  feat_global_title: "Глобальная сеть",
  feat_global_desc: "Высокодоступные серверы в нескольких регионах для быстрого и надёжного подключения где угодно.",
  feat_team_title: "Вам или вашей команде",
  feat_team_desc: "Используйте лично для повседневной приватности или разверните безопасный доступ для всей организации.",
  feat_throughput_title: "Высокая скорость",
  feat_throughput_desc: "Оптимизированная маршрутизация обеспечивает быстрое подключение для стриминга, звонков и работы.",
  feat_compliance_title: "Надёжное шифрование",
  feat_compliance_desc: "Современные протоколы шифрования защищают каждое соединение от начала до конца.",
  feat_deploy_title: "Мгновенная настройка",
  feat_deploy_desc: "Подключитесь за минуты. Кросс-платформенные клиенты для Windows, macOS, Linux, iOS и Android.",
  feat_infra_title: "Географически распределённая инфраструктура",
  feat_infra_desc: "Серверы в разных регионах — подключение к ближайшему и самому быстрому узлу, где бы вы ни находились.",
  feat_audience_title: "Частным лицам и компаниям",
  feat_audience_desc: "Предоставляем VPN-доступ как частным пользователям, так и компаниям, которым нужна защищённая связь для команды.",
  feat_apps_title: "Два собственных приложения",
  feat_apps_desc: "Open-source универсальный клиент для любого провайдера и отдельное приложение, заточенное под CheezyVPN. Сравнение — ниже.",
  // Landing — apps comparison section
  apps_title: "Выберите приложение",
  apps_subtitle: "Одно — универсальный open-source клиент. Другое создано именно для CheezyVPN — выбирайте то, что подходит вам.",
  apps_clash_badge: "Open Source",
  apps_clash_title: "CheezyClash",
  apps_clash_desc: "Прокси-клиент для Android с поддержкой VLESS, VMess, Trojan, Shadowsocks, Hysteria 2, WireGuard и других протоколов. Rule-based маршрутизация, Reality fingerprinting, нативная разработка на Kotlin — работает с любым совместимым сервисом, не только с нашим.",
  apps_clash_protocols_label: "Поддерживаемые протоколы",
  apps_clash_cta: "Скачать",
  apps_cheezy_badge: "Создано для CheezyVPN",
  apps_cheezy_title: "CheezyVPN",
  apps_cheezy_desc: "Наше собственное приложение, заточенное именно под этот сервис. Не нужно импортировать конфигурации — зарегистрируйтесь в приложении и сразу получите бесплатный пробный доступ, а подпиской можно управлять прямо с телефона.",
  apps_cheezy_cta: "Начать бесплатно — 14 дней",
  apps_trial_badge: "14 дней бесплатно",
  apps_compare_feature: "Функция",
  apps_row_import: "Нужен ручной импорт конфигурации",
  apps_row_thirdparty: "Работает со сторонними провайдерами",
  apps_row_trial: "Бесплатный пробный период при регистрации",
  apps_row_manage: "Управление подпиской в приложении",
  apps_row_opensource: "Открытый исходный код",
  // Landing — CTA + footer
  cta_title: "Готовы подключить вашу команду?",
  cta_desc: "Доступ возможен только по коду приглашения от действующего клиента или партнёра.",
  btn_create_account: "Создать аккаунт",
  footer_rights: "Все права защищены.",
  footer_tagline: "Безопасно · Приватно · Надёжно",
  // Login page
  login_title: "Вход",
  login_subtitle: "С возвращением",
  btn_login: "Войти",
  no_account: "Нет аккаунта?",
  btn_register: "Зарегистрироваться",
  login_invite_hint: "Регистрация только по коду приглашения",
  err_invalid_login: "Неверный email или пароль",
  err_banned: "Аккаунт заблокирован",
  err_login: "Ошибка входа. Попробуйте снова.",
  btn_tg_login: "Войти через Telegram",
  err_tg_login: "Ошибка входа через Telegram. Попробуйте снова.",
  err_tg_not_registered: "Аккаунт с этим Telegram не найден. Пройдите регистрацию.",
  // Verify email page
  verify_title: "Подтверждение email",
  verify_send_to: "Отправим код подтверждения на",
  verify_confirm_fallback: "Подтвердите свой email адрес",
  btn_send_code: "Отправить код",
  verify_sent_hint: "Код отправлен. Проверьте почту (в т.ч. папку «Спам»).",
  verify_code_label: "Код подтверждения (6 цифр)",
  val_code_req: "Введите код",
  val_code_len: "Код состоит из 6 цифр",
  btn_confirm: "Подтвердить",
  btn_resend: "Отправить повторно",
  verify_success_title: "Email подтверждён!",
  verify_success_text: "Переход в личный кабинет…",
  err_verify: "Ошибка подтверждения",
  err_code_invalid: "Неверный или истёкший код",
  err_code_expired: "Код истёк. Запросите новый.",
  // Register
  reg_title: "Регистрация",
  reg_subtitle: "Для регистрации необходим код приглашения",
  invite_label: "Код приглашения",
  invite_placeholder: "Например: ABCD1234",
  invite_checking: "Проверка кода…",
  invite_invalid: "Недействительный код",
  invite_valid: "Код действителен",
  discount_accepted: "Код принят!",
  discount_text: (pct) => `Скидка ${pct}% на первую оплату`,
  pwd_label: "Пароль",
  pwd_placeholder: "Минимум 8 символов",
  confirm_label: "Повтор пароля",
  confirm_placeholder: "Повторите пароль",
  btn_create: "Создать аккаунт",
  have_account: "Уже есть аккаунт?",
  sign_in: "Войти",
  err_email_taken: "Этот email уже зарегистрирован",
  err_invalid_invite: "Код приглашения недействителен",
  err_rate_limited: "Слишком много попыток. Подождите и попробуйте снова",
  err_req_invite: "Введите действительный код приглашения",
  err_reg: "Ошибка регистрации. Попробуйте снова.",
  err_network: "Ошибка сети. Проверьте соединение.",
  val_email_req: "Введите email",
  val_email_format: "Некорректный email",
  val_pwd_req: "Введите пароль",
  val_pwd_min: "Минимум 8 символов",
  val_confirm_req: "Повторите пароль",
  val_confirm_match: "Пароли не совпадают",
  val_invite_req: "Введите код приглашения",
  sub_title: "Моя подписка",
  btn_refresh: "Обновить",
  no_sub_title: "Нет активной подписки",
  no_sub_text: "Выберите тарифный план для начала работы",
  btn_buy_sub: "Купить подписку",
  err_load_sub: "Не удалось загрузить данные подписки",
  label_plan: "Тариф",
  label_status: "Статус",
  label_days_left: "Осталось дней",
  label_expires: "Действует до",
  label_devices: "Устройств",
  label_traffic: "Трафик",
  traffic_unlimited: "Безлимитный трафик",
  traffic_usage: "Использование трафика",
  copy_sub_link: "Как подключиться",
  status_active: "Активна",
  status_expired: "Истекла",
  status_disabled: "Отключена",
  status_limited: "Ограничена",
  buy_title: "Купить подписку",
  promo_active: "Промокод активен:",
  promo_applied: (pct) => `Скидка ${pct}% применена к ценам`,
  no_tariffs: "Тарифы не настроены",
  btn_pay: "Оплатить",
  err_load_plans: "Не удалось загрузить тарифы. Попробуйте позже.",
  invoice_title: "Счёт на оплату",
  to_pay: "К оплате:",
  without_discount: "Без скидки:",
  btn_proceed: "Перейти к оплате",
  err_rate_limited_inv: "Слишком много запросов",
  err_provider: "Платёжный провайдер недоступен",
  err_not_verified: "Сначала подтвердите email",
  err_invoice: "Ошибка создания счёта. Попробуйте позже.",
  btn_back: "Назад",
  discount_applied_msg: (pct) => `Скидка ${pct}% применена`,
  days: (n) => {
    if (n === 1) return "1 день";
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return `${n} дня`;
    return `${n} дней`;
  },
  dev_title: "Устройства",
  err_load_dev: "Не удалось загрузить устройства",
  err_remove_dev: "Не удалось удалить устройство",
  err_rate_limited_dev: "Слишком много запросов",
  col_device: "Устройство",
  col_platform: "Платформа",
  col_added: "Добавлено",
  unknown_device: "Неизвестное устройство",
  no_devices: "Нет подключённых устройств",
  dev_auto_registered: "Устройства регистрируются автоматически при использовании клиентского приложения.",
  confirm_remove: "Удалить устройство?",
  confirm_remove_desc: "Отключит это устройство от VPN",
  ok_remove: "Удалить",
  cancel: "Отмена",
  settings_title: "Настройки аккаунта",
  card_account: "Аккаунт",
  card_password: "Смена пароля",
  card_security: "Безопасность",
  label_email_status: "Статус email",
  label_telegram: "Telegram",
  status_verified: "Подтверждён",
  status_not_verified: "Не подтверждён",
  btn_verify: "Подтвердить",
  tg_linked: "Привязан",
  tg_not_linked: "Не привязан",
  pwd_current: "Текущий пароль",
  pwd_new: "Новый пароль",
  pwd_confirm_field: "Повтор пароля",
  val_pwd_current_req: "Введите текущий пароль",
  val_pwd_new_req: "Введите новый пароль",
  val_pwd_new_min: "Минимум 8 символов",
  val_pwd_confirm_req: "Повторите пароль",
  val_pwd_confirm_match: "Пароли не совпадают",
  btn_change_pwd: "Сменить пароль",
  btn_revoke_sessions: "Завершить все сессии",
  btn_logout_settings: "Выйти из аккаунта",
  confirm_revoke_title: "Завершить все сессии?",
  confirm_revoke_content: "Все устройства будут отключены, потребуется повторный вход.",
  ok_revoke: "Завершить",
  revoke_security_note: "«Завершить все сессии» отзывает все refresh-токены и выходит из системы на всех устройствах.",
  err_wrong_pwd: "Неверный текущий пароль",
  err_rate_limited_pwd: "Слишком много попыток",
  msg_pwd_changed: "Пароль изменён. Выполните вход снова.",
  msg_sessions_revoked: "Все сессии завершены",
  err_revoke_sessions: "Не удалось завершить сессии",
  msg_code_sent: "Код отправлен на ваш email",
  err_send_code: "Не удалось отправить код",
  err_change_pwd: "Ошибка смены пароля",
  // Credential setup
  card_setup_email: "Задать Email и пароль",
  setup_email_hint: "Добавьте вход по email к вашему аккаунту. Код подтверждения будет отправлен на указанный адрес.",
  setup_email_label: "Email",
  setup_pwd_new_label: "Пароль",
  setup_pwd_confirm_label: "Повтор пароля",
  btn_setup_send_code: "Отправить код подтверждения",
  setup_code_sent_hint: (email) => `Код отправлен на ${email}. Проверьте почту (и папку «Спам»).`,
  setup_code_label: "Код подтверждения (6 цифр)",
  btn_setup_confirm: "Подтвердить и сохранить",
  setup_success_email: "Email и пароль успешно установлены!",
  card_setup_password: "Задать пароль",
  setup_password_hint: (email) => `На вашем аккаунте установлен email (${email}), но нет пароля. Для его установки подтвердите email кодом.`,
  btn_setup_pwd_send_code: "Отправить код на email",
  setup_pwd_code_sent_hint: "Код отправлен. Введите его ниже вместе с новым паролем.",
  setup_success_password: "Пароль успешно установлен!",
  err_email_already_set: "Email уже установлен для этого аккаунта",
  err_password_already_set: "Пароль уже установлен для этого аккаунта",
  err_setup_email: "Не удалось установить email. Попробуйте снова.",
  err_setup_password: "Не удалось установить пароль. Попробуйте снова.",
  btn_link_telegram: "Привязать Telegram",
  btn_unlink_telegram: "Отвязать",
  tg_link_opened: "Ссылка открыта — нажмите Start в боте, затем обновите эту страницу",
  err_tg_link: "Не удалось создать ссылку Telegram",
  err_tg_unlink: "Не удалось отвязать Telegram",
  confirm_unlink_tg: "Отвязать Telegram?",
  confirm_unlink_tg_body: "Аккаунт Telegram будет отключён. Вы сможете привязать его снова позже.",
  // Promo codes
  menu_support: "Поддержка",
  promo_title: "Промокод",
  promo_active_label: "Активный промокод:",
  promo_code_placeholder: "Введите промокод",
  promo_cant_activate: "Промокод активен — будет применён к следующему платежу.",
  btn_activate_promo: "Применить",
  err_promo_invalid: "Неверный промокод",
  err_promo_own: "Нельзя использовать собственный промокод",
  err_promo_already_used: "Вы уже использовали этот промокод",
  err_promo_active_exists: "Промокод уже активен — сначала используйте его",
  err_promo_referral_only_one: "Реферальный код уже был использован",
  err_promo_referral_not_new: "Реферальные коды доступны только новым пользователям",
  err_promo_activate: "Не удалось активировать промокод",
  msg_promo_activated: (pct) => `Промокод активирован — скидка ${pct}%`,
  // Support tickets
  support_title: "Поддержка",
  btn_new_ticket: "Новое обращение",
  ticket_list_empty: "Обращений пока нет",
  ticket_subject_label: "Тема",
  ticket_subject_placeholder: "Краткое описание проблемы",
  ticket_message_label: "Сообщение",
  ticket_message_placeholder: "Опишите проблему подробнее…",
  btn_send_ticket: "Отправить",
  err_create_ticket: "Не удалось создать обращение",
  err_load_tickets: "Не удалось загрузить обращения",
  err_load_ticket: "Не удалось загрузить обращение",
  err_send_reply: "Не удалось отправить ответ",
  err_too_many_tickets: "Слишком много открытых обращений. Закройте некоторые.",
  ticket_status_open: "Открыто",
  ticket_status_in_progress: "В работе",
  ticket_status_closed: "Закрыто",
  reply_placeholder: "Введите ответ…",
  btn_send_reply: "Отправить",
  val_subject_req: "Введите тему",
  val_message_req: "Введите сообщение",
  btn_back_to_tickets: "Назад к обращениям",
  lbl_you: "Вы",
  lbl_support_agent: "Поддержка",
  btn_attach_image: "Прикрепить изображение",
  err_too_many_images: "Можно прикрепить не более 3 изображений",
  err_image_too_large: "Файл слишком большой (макс. 5MB)",
  err_unsupported_image_type: "Неподдерживаемый тип изображения",
  val_attachment_limit: "До 3 изображений, до 5MB каждое",
  // Landing — individuals section
  ind_badge: "Частным лицам",
  ind_title: "Ваша приватность в один тап",
  ind_desc: "Зашифрованное скоростное подключение, которое сохраняет вашу связь приватной в любой сети. Без логов активности и слежки — просто защищённый туннель для повседневного интернета. Начните бесплатно в Telegram, без карты.",
  ind_cta: "Попробовать бесплатно в Telegram",
  // Landing — business / partnership section
  biz_badge: "Бизнесу",
  biz_title: "Сотрудничество",
  biz_desc: "Хотите предоставить приватное подключение своей команде, перепродавать доступ или интегрировать нашу инфраструктуру? Опишите вашу цель — и мы свяжемся с вами.",
  // Partnership form
  partner_goal_label: "Цель",
  partner_goal_ph: "напр. партнёрство-реселлер, доступ для команды, интеграция",
  partner_desc_label: "Описание",
  partner_desc_ph: "Расскажите подробнее, что вы ищете…",
  partner_contact_label: "Контакты",
  partner_contact_ph: "Telegram, email или любой способ связи",
  partner_submit: "Отправить заявку",
  partner_success: "Спасибо! Заявка отправлена — мы свяжемся с вами.",
  partner_error: "Не удалось отправить заявку. Попробуйте позже.",
  val_partner_goal: "Укажите вашу цель",
  val_partner_desc: "Добавьте короткое описание",
  val_partner_contact: "Оставьте способ связи с вами",
  // Footer + legal
  footer_disclaimer: "Данный ресурс не предназначен для обхода блокировок.",
  footer_legal_heading: "Документы",
  footer_policy: "Политика конфиденциальности",
  footer_agreement: "Пользовательское соглашение",
  footer_offer: "Публичная оферта",
  footer_telegram: "Telegram",
  legal_back: "← На главную",
};

const T: Record<Lang, Translations> = { en, ru };

interface LangCtx {
  lang: Lang;
  L: Translations;
  toggle: () => void;
}

const LangContext = createContext<LangCtx>({
  lang: "en",
  L: en,
  toggle: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(savedLang);

  function toggle() {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "ru" : "en";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }

  return (
    <LangContext.Provider value={{ lang, L: T[lang], toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangCtx {
  return useContext(LangContext);
}
