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
  apps_clash_docs: string;
  apps_platforms_label: string;
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
  apps_opensource_footnote: string;
  apps_row_multiplatform: string;
  // Landing — download picker modal
  download_modal_subtitle: string;
  platform_android: string;
  platform_windows: string;
  platform_macos: string;
  platform_linux: string;
  download_win_installer: string;
  download_win_portable: string;
  download_mac_arm64: string;
  download_mac_x64: string;
  download_linux_appimage: string;
  download_linux_deb: string;
  arch_modal_subtitle: string;
  arch_arm64_label: string;
  arch_arm64_badge: string;
  arch_arm64_desc: string;
  arch_universal_label: string;
  arch_universal_badge: string;
  arch_universal_desc: string;
  arch_armv7_label: string;
  arch_armv7_desc: string;
  arch_x86_label: string;
  arch_x86_desc: string;
  arch_modal_all_releases: string;
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
  credit_grant_text: (n: number) => string;
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
  bonus_balance: (n: number) => string;
  points_hint: string;
  btn_pay_credits: (points: number) => string;
  msg_paid_with_credits: string;
  err_insufficient_credits: string;
  no_tariffs: string;
  btn_pay: string;
  err_load_plans: string;
  invoice_title: string;
  to_pay: string;
  btn_proceed: string;
  err_rate_limited_inv: string;
  err_provider: string;
  err_not_verified: string;
  err_invoice: string;
  btn_back: string;
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
  promo_balance_label: string;
  promo_last_code_label: string;
  promo_code_placeholder: string;
  promo_balance_hint: string;
  btn_activate_promo: string;
  err_promo_invalid: string;
  err_promo_own: string;
  err_promo_already_used: string;
  err_promo_referral_only_one: string;
  err_promo_referral_not_new: string;
  err_promo_activate: string;
  msg_promo_activated: (grant: number, balance: number) => string;
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
  // Claim page (subscription → account)
  claim_title: string;
  claim_subtitle: string;
  claim_url_label: string;
  claim_url_placeholder: string;
  btn_claim_check: string;
  claim_checking: string;
  claim_login_hint: (hint: string) => string;
  claim_use_other_email: string;
  claim_setup_hint: (hint: string) => string;
  claim_register_hint: (hint: string) => string;
  claim_register_bind_hint: string;
  claim_acc_email_label: string;
  claim_no_email_title: string;
  claim_no_email_text: string;
  claim_done_title: string;
  claim_done_text: string;
  btn_open_in_app: string;
  btn_import_only: string;
  claim_open_app_hint: string;
  btn_go_dashboard: string;
  claim_foreign_title: string;
  claim_foreign_text: string;
  err_claim_not_found: string;
  err_claim_bad_url: string;
  err_claim_expired: string;
  err_claim: string;
  err_app_login: string;
  // Forgot password
  forgot_link: string;
  forgot_title: string;
  forgot_subtitle: string;
  forgot_code_sent: string;
  new_pwd_label: string;
  btn_reset_password: string;
  reset_success: string;
  back_to_login: string;
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
  nav_individuals: "For personal use",
  nav_business: "For teams",
  // Landing — hero
  hero_badge: "Privacy-first · Secure connectivity",
  hero_title_1: "Secure & Privacy",
  hero_title_2: "Access",
  hero_desc: "Fast, encrypted connectivity designed to help protect your data on any network — for personal and team use.",
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
  feat_deploy_desc: "Connect in minutes. Native clients for Windows, macOS, Linux and Android.",
  feat_infra_title: "Geographically Distributed Infrastructure",
  feat_infra_desc: "Servers spread across multiple regions so you connect to the nearest, fastest node — wherever you are.",
  feat_audience_title: "For personal use and teams",
  feat_audience_desc: "Secure connectivity for individuals and organizations that need dependable access for their teams.",
  feat_apps_title: "Two Apps Built by Us",
  feat_apps_desc: "Two cross-platform apps — an open-source universal client and a dedicated CheezyVPN app for desktop and mobile. See the comparison below.",
  // Landing — apps comparison section
  apps_title: "Choose Your App",
  apps_subtitle: "Both run on Windows, macOS, Linux and Android. One is a universal open-source client; the other is built specifically for CheezyVPN.",
  apps_clash_badge: "Open Source",
  apps_clash_title: "CheezyClash",
  apps_clash_desc: "Cross-platform Mihomo (Clash.Meta) client for Windows, macOS, Linux and Android. Supports VLESS, VMess, Trojan, Shadowsocks, Hysteria 2, WireGuard and more — rule-based routing, Proxy/TUN modes, works with any compatible service.",
  apps_clash_protocols_label: "Supported protocols",
  apps_clash_cta: "Download",
  apps_clash_docs: "Documentation",
  apps_platforms_label: "Available on",
  apps_cheezy_badge: "Made for CheezyVPN",
  apps_cheezy_title: "CheezyVPN",
  apps_cheezy_desc: "Our dedicated app for Windows, macOS, Linux and Android. No configs to import — register in the app, get a free 14-day trial instantly, and manage your subscription from any device.",
  apps_cheezy_cta: "Start free — 14 days",
  apps_trial_badge: "14 days free",
  apps_compare_feature: "Feature",
  apps_row_import: "Manual config import required",
  apps_row_thirdparty: "Works with third-party providers",
  apps_row_trial: "Free trial on sign-up",
  apps_row_manage: "Manage subscription in-app",
  apps_row_opensource: "Open source",
  apps_opensource_footnote: "Built on the open-source CheezyClash codebase",
  apps_row_multiplatform: "Windows, macOS, Linux & Android",
  // Landing — download picker modal
  download_modal_subtitle: "Choose your platform and version.",
  platform_android: "Android",
  platform_windows: "Windows",
  platform_macos: "macOS",
  platform_linux: "Linux",
  download_win_installer: "Installer (.exe)",
  download_win_portable: "Portable (.zip)",
  download_mac_arm64: "Apple Silicon (.dmg)",
  download_mac_x64: "Intel Mac (.dmg)",
  download_linux_appimage: "AppImage (x64)",
  download_linux_deb: "Debian package (.deb)",
  arch_modal_subtitle: "Pick the APK that matches your phone's processor. Not sure? Use Universal.",
  arch_arm64_label: "ARM64 (arm64-v8a)",
  arch_arm64_badge: "Recommended",
  arch_arm64_desc: "The right choice for almost all Android phones released since 2019.",
  arch_universal_label: "Universal",
  arch_universal_badge: "Not sure? Choose this",
  arch_universal_desc: "Works on any device — larger file, but always compatible if you don't know your phone's architecture.",
  arch_armv7_label: "ARM (armeabi-v7a)",
  arch_armv7_desc: "For older or budget Android devices (before 2019).",
  arch_x86_label: "x86_64",
  arch_x86_desc: "For Android on Intel/AMD hardware — emulators, some tablets and Chromebooks.",
  arch_modal_all_releases: "See all versions on GitHub",
  // Landing — CTA + footer
  cta_title: "Secure access for your team",
  cta_desc: "Access requires an invitation code from an existing client or partner.",
  btn_create_account: "Create Account",
  footer_rights: "All rights reserved.",
  footer_tagline: "Secure · Privacy-minded · Reliable",
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
  credit_grant_text: (n) => `${n} bonus points 🪙`,
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
  bonus_balance: (n) => `Bonus balance: ${n} 🪙`,
  points_hint: "1 point = 1 🪙 of plan price",
  btn_pay_credits: (points) => `Pay with points · ${points} 🪙`,
  msg_paid_with_credits: "Subscription activated with bonus points",
  err_insufficient_credits: "Not enough bonus points for this plan",
  no_tariffs: "No plans configured",
  btn_pay: "Pay",
  err_load_plans: "Failed to load plans. Try again.",
  invoice_title: "Payment Invoice",
  to_pay: "To pay:",
  btn_proceed: "Proceed to Payment",
  err_rate_limited_inv: "Too many requests",
  err_provider: "Payment provider unavailable",
  err_not_verified: "Please verify your email first",
  err_invoice: "Failed to create invoice. Try again.",
  btn_back: "Back",
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
  promo_balance_label: "Bonus balance",
  promo_last_code_label: "Last activated code",
  promo_code_placeholder: "Enter promo code",
  promo_balance_hint: "Credits are added immediately and can be spent in the Buy tab.",
  btn_activate_promo: "Activate",
  err_promo_invalid: "Invalid promo code",
  err_promo_own: "Cannot use your own promo code",
  err_promo_already_used: "You have already used this promo code",
  err_promo_referral_only_one: "You have already used a referral code",
  err_promo_referral_not_new: "Referral codes are for new users only",
  err_promo_activate: "Failed to activate promo code",
  msg_promo_activated: (grant, balance) => `+${grant} 🪙 added (balance: ${balance} 🪙)`,
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
  ind_badge: "For personal use",
  ind_title: "Privacy, in one tap",
  ind_desc: "Encrypted, high-speed access that helps protect your connection on any network. Privacy-minded design for everyday browsing.",
  ind_cta: "Try free in Telegram",
  // Landing — business / partnership section
  biz_badge: "For teams",
  biz_title: "Collaboration & integration",
  biz_desc: "Interested in secure connectivity for your organization, integration work, or network/security projects? Tell us your goal and we'll get back to you.",
  // Partnership form
  partner_goal_label: "Goal",
  partner_goal_ph: "e.g. team access, infrastructure integration, security project",
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
  // Claim page (subscription → account)
  claim_title: "Connect your subscription",
  claim_subtitle: "Sign in or create an account for your subscription link",
  claim_url_label: "Subscription link",
  claim_url_placeholder: "https://…",
  btn_claim_check: "Continue",
  claim_checking: "Checking your subscription…",
  claim_login_hint: (hint) => `An account already exists for this subscription (${hint}). Sign in to continue.`,
  claim_use_other_email: "Wrong email? Use a different one",
  claim_setup_hint: (hint) => `We sent a code to ${hint}. Enter the code and set a password for sign-in.`,
  claim_register_hint: (hint) => `We sent a code to ${hint}. Enter the code and create an account for this subscription.`,
  claim_acc_email_label: "Sign-in email",
  claim_register_bind_hint: "Create an account — this subscription will be linked to it.",
  claim_no_email_title: "No email on this subscription",
  claim_no_email_text: "We can't verify ownership by email. If the subscription was issued via Telegram, sign in with Telegram below, or claim it from the mobile app using your Remnawave email/username.",
  claim_done_title: "You're all set",
  claim_done_text: "Your subscription is linked to your account.",
  btn_open_in_app: "Open in app",
  btn_import_only: "Import subscription only (no account)",
  claim_open_app_hint: "The app will sign in automatically. The link is valid for 90 seconds and works once.",
  btn_go_dashboard: "Go to dashboard",
  claim_foreign_title: "Different subscription",
  claim_foreign_text: "You are signed in, but this subscription link belongs to a different account. You can transfer it in Settings → Transfer subscription, or import it into the app without signing in.",
  err_claim_not_found: "Subscription not found",
  err_claim_bad_url: "Invalid subscription link",
  err_claim_expired: "Session expired — start over",
  err_claim: "Couldn't check the subscription",
  err_app_login: "Couldn't create the app sign-in link",
  // Forgot password
  forgot_link: "Forgot password?",
  forgot_title: "Password reset",
  forgot_subtitle: "Enter your account email — we'll send a reset code.",
  forgot_code_sent: "If the email is registered, a code has been sent.",
  new_pwd_label: "New password",
  btn_reset_password: "Reset password",
  reset_success: "Password updated — sign in with the new password.",
  back_to_login: "← Back to sign in",
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
  nav_individuals: "Для личного использования",
  nav_business: "Для команд",
  // Landing — hero
  hero_badge: "Privacy-first · Защищенное подключение",
  hero_title_1: "Безопасный и приватный",
  hero_title_2: "доступ",
  hero_desc: "Быстрое зашифрованное подключение, которое помогает защищать ваши данные в любой сети — для личного использования и команд.",
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
  feat_deploy_desc: "Подключитесь за минуты. Нативные клиенты для Windows, macOS, Linux и Android.",
  feat_infra_title: "Географически распределённая инфраструктура",
  feat_infra_desc: "Серверы в разных регионах — подключение к ближайшему и самому быстрому узлу, где бы вы ни находились.",
  feat_audience_title: "Для личного использования и команд",
  feat_audience_desc: "Защищенное подключение для частных пользователей и организаций, которым нужен надежный доступ для команды.",
  feat_apps_title: "Два собственных приложения",
  feat_apps_desc: "Два кросс-платформенных приложения — open-source универсальный клиент и отдельное приложение CheezyVPN для компьютера и телефона. Сравнение — ниже.",
  // Landing — apps comparison section
  apps_title: "Выберите приложение",
  apps_subtitle: "Оба работают на Windows, macOS, Linux и Android. Одно — универсальный open-source клиент, другое создано именно для CheezyVPN.",
  apps_clash_badge: "Open Source",
  apps_clash_title: "CheezyClash",
  apps_clash_desc: "Кросс-платформенный Mihomo (Clash.Meta) клиент для Windows, macOS, Linux и Android. Поддержка VLESS, VMess, Trojan, Shadowsocks, Hysteria 2, WireGuard и других протоколов — rule-based маршрутизация, режимы Proxy/TUN, работает с любым совместимым сервисом.",
  apps_clash_protocols_label: "Поддерживаемые протоколы",
  apps_clash_cta: "Скачать",
  apps_clash_docs: "Документация",
  apps_platforms_label: "Доступно на",
  apps_cheezy_badge: "Создано для CheezyVPN",
  apps_cheezy_title: "CheezyVPN",
  apps_cheezy_desc: "Наше приложение для Windows, macOS, Linux и Android. Не нужно импортировать конфигурации — зарегистрируйтесь в приложении, сразу получите 14 дней бесплатно и управляйте подпиской с любого устройства.",
  apps_cheezy_cta: "Начать бесплатно — 14 дней",
  apps_trial_badge: "14 дней бесплатно",
  apps_compare_feature: "Функция",
  apps_row_import: "Нужен ручной импорт конфигурации",
  apps_row_thirdparty: "Работает со сторонними провайдерами",
  apps_row_trial: "Бесплатный пробный период при регистрации",
  apps_row_manage: "Управление подпиской в приложении",
  apps_row_opensource: "Открытый исходный код",
  apps_opensource_footnote: "Основано на open-source кодовой базе CheezyClash",
  apps_row_multiplatform: "Windows, macOS, Linux и Android",
  // Landing — download picker modal
  download_modal_subtitle: "Выберите платформу и версию.",
  platform_android: "Android",
  platform_windows: "Windows",
  platform_macos: "macOS",
  platform_linux: "Linux",
  download_win_installer: "Установщик (.exe)",
  download_win_portable: "Портативная (.zip)",
  download_mac_arm64: "Apple Silicon (.dmg)",
  download_mac_x64: "Intel Mac (.dmg)",
  download_linux_appimage: "AppImage (x64)",
  download_linux_deb: "Пакет Debian (.deb)",
  arch_modal_subtitle: "Выберите APK под процессор телефона. Не уверены — используйте Universal.",
  arch_arm64_label: "ARM64 (arm64-v8a)",
  arch_arm64_badge: "Рекомендуется",
  arch_arm64_desc: "Подходит почти всем Android-телефонам, выпущенным начиная примерно с 2019 года.",
  arch_universal_label: "Universal",
  arch_universal_badge: "Не уверены? Выберите это",
  arch_universal_desc: "Работает на любом устройстве — файл больше, но точно подойдёт, если вы не знаете архитектуру телефона.",
  arch_armv7_label: "ARM (armeabi-v7a)",
  arch_armv7_desc: "Для старых или бюджетных Android-устройств (до 2019 года).",
  arch_x86_label: "x86_64",
  arch_x86_desc: "Для Android на Intel/AMD — эмуляторы, некоторые планшеты и Chromebook.",
  arch_modal_all_releases: "Все версии на GitHub",
  // Landing — CTA + footer
  cta_title: "Защищенный доступ для команды",
  cta_desc: "Доступ возможен только по коду приглашения от действующего клиента или партнёра.",
  btn_create_account: "Создать аккаунт",
  footer_rights: "Все права защищены.",
  footer_tagline: "Безопасно · C заботой о приватности · Надёжно",
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
  credit_grant_text: (n) => `${n} бонусных баллов 🪙`,
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
  bonus_balance: (n) => `Бонусный баланс: ${n} 🪙`,
  points_hint: "1 балл = 1 🪙 стоимости тарифа",
  btn_pay_credits: (points) => `Оплатить баллами · ${points} 🪙`,
  msg_paid_with_credits: "Подписка активирована за бонусные баллы",
  err_insufficient_credits: "Недостаточно баллов для этого тарифа",
  no_tariffs: "Тарифы не настроены",
  btn_pay: "Оплатить",
  err_load_plans: "Не удалось загрузить тарифы. Попробуйте позже.",
  invoice_title: "Счёт на оплату",
  to_pay: "К оплате:",
  btn_proceed: "Перейти к оплате",
  err_rate_limited_inv: "Слишком много запросов",
  err_provider: "Платёжный провайдер недоступен",
  err_not_verified: "Сначала подтвердите email",
  err_invoice: "Ошибка создания счёта. Попробуйте позже.",
  btn_back: "Назад",
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
  promo_balance_label: "Бонусный баланс",
  promo_last_code_label: "Последний активированный код",
  promo_code_placeholder: "Введите промокод",
  promo_balance_hint: "Кредиты начисляются сразу и тратятся во вкладке «Покупка».",
  btn_activate_promo: "Применить",
  err_promo_invalid: "Неверный промокод",
  err_promo_own: "Нельзя использовать собственный промокод",
  err_promo_already_used: "Вы уже использовали этот промокод",
  err_promo_referral_only_one: "Реферальный код уже был использован",
  err_promo_referral_not_new: "Реферальные коды доступны только новым пользователям",
  err_promo_activate: "Не удалось активировать промокод",
  msg_promo_activated: (grant, balance) => `+${grant} кредитов (баланс: ${balance})`,
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
  ind_badge: "Для личного использования",
  ind_title: "Приватность в один тап",
  ind_desc: "Зашифрованное скоростное подключение, которое помогает защищать вашу связь в любой сети. Дизайн с фокусом на приватность для повседневного интернета.",
  ind_cta: "Попробовать бесплатно в Telegram",
  // Landing — business / partnership section
  biz_badge: "Для команд",
  biz_title: "Сотрудничество и интеграции",
  biz_desc: "Интересует защищенное подключение для организации, интеграционные задачи или проекты в сети/безопасности? Опишите цель — и мы свяжемся с вами.",
  // Partnership form
  partner_goal_label: "Цель",
  partner_goal_ph: "напр. доступ для команды, интеграция инфраструктуры, проект по безопасности",
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
  // Claim page (subscription → account)
  claim_title: "Подключение подписки",
  claim_subtitle: "Войдите или создайте аккаунт для вашей ссылки подписки",
  claim_url_label: "Ссылка подписки",
  claim_url_placeholder: "https://…",
  btn_claim_check: "Продолжить",
  claim_checking: "Проверяем вашу подписку…",
  claim_login_hint: (hint) => `Для этой подписки уже есть аккаунт (${hint}). Войдите, чтобы продолжить.`,
  claim_use_other_email: "Не тот email? Указать другой",
  claim_setup_hint: (hint) => `Мы отправили код на ${hint}. Введите код и задайте пароль для входа.`,
  claim_register_hint: (hint) => `Мы отправили код на ${hint}. Введите код и создайте учётную запись для этой подписки.`,
  claim_acc_email_label: "Email для входа",
  claim_register_bind_hint: "Создайте учётную запись — эта подписка будет привязана к новому аккаунту.",
  claim_no_email_title: "У подписки нет email",
  claim_no_email_text: "Мы не можем подтвердить владение по email. Если подписка выдана через Telegram — войдите через Telegram ниже, либо привяжите её из мобильного приложения по email/username из Remnawave.",
  claim_done_title: "Готово",
  claim_done_text: "Подписка привязана к вашему аккаунту.",
  btn_open_in_app: "Открыть в приложении",
  btn_import_only: "Только импортировать подписку (без аккаунта)",
  claim_open_app_hint: "Приложение авторизуется автоматически. Ссылка действует 90 секунд и работает один раз.",
  btn_go_dashboard: "Перейти в кабинет",
  claim_foreign_title: "Другая подписка",
  claim_foreign_text: "Вы вошли в аккаунт, но эта ссылка подписки принадлежит другому аккаунту. Перенести её можно в Настройках → Перенос подписки, либо импортируйте её в приложение без входа.",
  err_claim_not_found: "Подписка не найдена",
  err_claim_bad_url: "Неверная ссылка подписки",
  err_claim_expired: "Сессия истекла — начните заново",
  err_claim: "Не удалось проверить подписку",
  err_app_login: "Не удалось создать ссылку входа для приложения",
  // Forgot password
  forgot_link: "Забыли пароль?",
  forgot_title: "Сброс пароля",
  forgot_subtitle: "Укажите email аккаунта — мы отправим код для сброса.",
  forgot_code_sent: "Если email зарегистрирован, код отправлен.",
  new_pwd_label: "Новый пароль",
  btn_reset_password: "Сбросить пароль",
  reset_success: "Пароль обновлён — войдите с новым паролем.",
  back_to_login: "← Вернуться ко входу",
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
