/**
 * Legal document bodies (Privacy Policy, User Agreement, Public Offer),
 * bilingual (EN/RU). Kept out of locale.tsx so long-form prose doesn't bloat
 * the UI string table.
 *
 * Text is privacy-first by design: we store only the account login credential
 * (email), collect no browsing/traffic/personal data, and never frame the
 * service as a means of circumventing lawful restrictions. Payments run through
 * third-party aggregators. Jurisdiction/retention specifics are intentionally
 * generalised.
 *
 * Seller name comes from `SELLER_NAME` (CI var, falls back to brand) and the
 * contact channel is the Telegram bot link (`BOT_URL`).
 */
import { Lang } from "../../locale";
import { BRAND_NAME, SELLER_NAME, BOT_URL } from "../../branding";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
  footnote?: string;
}

export type LegalKind = "policy" | "agreement" | "offer";

const CONTACT = BOT_URL || "[Telegram]";

function policy(lang: Lang): LegalDoc {
  const brand = BRAND_NAME;
  if (lang === "ru") {
    return {
      title: "Политика конфиденциальности",
      updated: "Настоящая политика описывает, какие данные обрабатывает сервис и как они защищаются.",
      intro: `${brand} — сервис с упором на приватность. Мы минимизируем сбор данных на уровне архитектуры.`,
      sections: [
        {
          heading: "1. Какие данные мы собираем",
          paragraphs: ["Мы собираем минимум данных, необходимый для работы сервиса:"],
          bullets: [
            "Данные для входа: адрес электронной почты (для авторизации и восстановления доступа).",
            "Записи об оплате: обрабатываются сторонними платёжными агрегаторами; данные карт мы не храним.",
            "Технические данные, необходимые для работы: статус подписки, время подключения, суммарный объём трафика (без анализа содержимого).",
          ],
        },
        {
          heading: "2. Что мы никогда не собираем",
          bullets: [
            "Историю посещённых сайтов",
            "Содержимое вашего трафика (файлы, сообщения)",
            "Рекламные или следящие профили",
          ],
        },
        {
          heading: "3. Использование данных",
          paragraphs: ["Данные используются исключительно для:"],
          bullets: [
            "Предоставления и поддержания доступа к VPN",
            "Обработки платежей и предотвращения злоупотреблений",
            "Оказания поддержки и уведомлений о важных изменениях сервиса",
          ],
        },
        {
          heading: "4. Защита данных",
          paragraphs: [
            "Данные хранятся на зашифрованных серверах. Ключи доступа к VPN генерируются автоматически и удаляются при завершении подписки.",
          ],
        },
        {
          heading: "5. Передача третьим лицам",
          paragraphs: ["Мы передаём данные только:"],
          bullets: [
            "Платёжным системам — для проведения транзакций",
            "В случаях, прямо предусмотренных применимым законодательством",
          ],
        },
        {
          heading: "6. Срок хранения",
          paragraphs: [
            "Данные аккаунта хранятся, пока аккаунт активен, и удаляются после его закрытия либо раньше — по вашему запросу. Мы не продаём ваши данные.",
          ],
        },
        {
          heading: "7. Ваши права",
          paragraphs: [
            `Вы можете запросить доступ к своим данным, их исправление или удаление аккаунта и связанных данных. Для этого свяжитесь с нами: ${CONTACT}`,
          ],
        },
      ],
      footnote: `Используя сервис ${brand}, вы подтверждаете согласие с настоящей политикой.`,
    };
  }
  return {
    title: "Privacy Policy",
    updated: "This policy explains what data the service processes and how it is protected.",
    intro: `${brand} is a privacy-focused service. We minimise data collection by design.`,
    sections: [
      {
        heading: "1. What we collect",
        paragraphs: ["We collect the minimum data needed to run the service:"],
        bullets: [
          "Account login data: your email address (to sign in and recover access).",
          "Payment records: processed by third-party payment aggregators; we do not store card details.",
          "Technical data needed to operate the service: subscription status, connection time, aggregate traffic volume (no content inspection).",
        ],
      },
      {
        heading: "2. What we never collect",
        bullets: [
          "Your browsing history or visited sites",
          "The content of your traffic (files, messages)",
          "Advertising or tracking profiles",
        ],
      },
      {
        heading: "3. How we use data",
        paragraphs: ["Data is used solely to:"],
        bullets: [
          "Provide and maintain your VPN access",
          "Process payments and prevent abuse",
          "Provide support and notify you about important service changes",
        ],
      },
      {
        heading: "4. Data protection",
        paragraphs: [
          "Data is stored on encrypted servers. VPN access keys are generated automatically and removed when your subscription ends.",
        ],
      },
      {
        heading: "5. Sharing with third parties",
        paragraphs: ["We share data only:"],
        bullets: [
          "With payment processors to complete transactions",
          "Where required by applicable law",
        ],
      },
      {
        heading: "6. Retention",
        paragraphs: [
          "We keep account data while your account is active and delete it after the account is closed, or earlier on request. We do not sell your data.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          `You may request access to your data, correct it, or delete your account and associated data. To do so, contact us: ${CONTACT}`,
        ],
      },
    ],
    footnote: `By using ${brand}, you agree to this policy.`,
  };
}

function agreement(lang: Lang): LegalDoc {
  const brand = BRAND_NAME;
  if (lang === "ru") {
    return {
      title: "Пользовательское соглашение",
      updated: "Настоящее соглашение регулирует использование сервиса.",
      sections: [
        {
          heading: "1. Предмет соглашения",
          bullets: [
            `${brand} предоставляет доступ к VPN-серверам, которые шифруют интернет-трафик для защиты вашей приватности и безопасности.`,
            "Услуги доступны совершеннолетним пользователям. Использование сервиса означает акцепт соглашения.",
            "Сервис является инструментом приватности и не предназначен для обхода блокировок или любой противоправной деятельности.",
          ],
        },
        {
          heading: "2. Условия использования",
          paragraphs: ["Пользователь обязуется не:"],
          bullets: [
            "Использовать сервис в противоправных целях",
            "Распространять вредоносное ПО, проводить DDoS-атаки, рассылать спам или совершать взломы",
            "Перепродавать или передавать аккаунт без разрешения",
            "Мешать работе сервиса",
          ],
        },
        {
          heading: "3. Оплата и возврат",
          bullets: [
            "Оплата тарифов производится через поддерживаемые платёжные сервисы.",
            "Возврат средств возможен при технической невозможности предоставить услугу.",
          ],
        },
        {
          heading: "4. Доступность и ответственность",
          bullets: [
            "Мы стремимся к высокой доступности, но не гарантируем бесперебойную работу.",
            "Мы не несём ответственности за противоправные действия пользователей и за ущерб из-за перерывов в работе сервиса.",
          ],
        },
        {
          heading: "5. Расторжение",
          bullets: [
            "Мы вправе приостановить аккаунт при нарушении соглашения.",
            "Вы можете прекратить использование сервиса в любой момент.",
          ],
        },
        {
          heading: "6. Контакты",
          paragraphs: [`Поддержка: ${CONTACT}`],
        },
      ],
      footnote: `Используя сервис ${brand}, вы подтверждаете, что ознакомились и согласны с условиями соглашения.`,
    };
  }
  return {
    title: "User Agreement",
    updated: "This agreement governs your use of the service.",
    sections: [
      {
        heading: "1. Subject",
        bullets: [
          `${brand} provides access to VPN servers that encrypt your internet traffic to protect your privacy and security.`,
          "The service is available to adults. Using the service constitutes acceptance of this agreement.",
          "The service is a privacy tool and is not intended for circumventing lawful restrictions or for any unlawful activity.",
        ],
      },
      {
        heading: "2. Acceptable use",
        paragraphs: ["You agree not to:"],
        bullets: [
          "Use the service for any unlawful purpose",
          "Distribute malware, or conduct DDoS attacks, spam or intrusion attempts",
          "Resell or share your account without authorisation",
          "Interfere with the operation of the service",
        ],
      },
      {
        heading: "3. Payment & refunds",
        bullets: [
          "Plans are paid through supported payment providers.",
          "Refunds are available where we are technically unable to provide the service.",
        ],
      },
      {
        heading: "4. Availability & liability",
        bullets: [
          "We aim for high availability but do not guarantee uninterrupted service.",
          "We are not liable for unlawful actions of users or for damages arising from service interruptions.",
        ],
      },
      {
        heading: "5. Termination",
        bullets: [
          "We may suspend accounts that violate this agreement.",
          "You may stop using the service at any time.",
        ],
      },
      {
        heading: "6. Contact",
        paragraphs: [`Support: ${CONTACT}`],
      },
    ],
    footnote: `By using ${brand}, you confirm you have read and accept this agreement.`,
  };
}

function offer(lang: Lang): LegalDoc {
  const brand = BRAND_NAME;
  const seller = SELLER_NAME;
  if (lang === "ru") {
    return {
      title: "Публичная оферта",
      updated: "Настоящая оферта определяет условия продажи доступа к сервису.",
      intro: `Настоящая публичная оферта заключается между ${seller} («Исполнитель») и клиентом.`,
      sections: [
        {
          heading: "1. Общие положения",
          bullets: [
            "Настоящий документ является публичной офертой (договором).",
            "Оформление заказа и/или оплата означают полный акцепт настоящих условий.",
          ],
        },
        {
          heading: "2. Предмет оферты",
          paragraphs: [
            `Исполнитель предоставляет клиенту платный доступ к VPN-сервису ${brand} на выбранный тариф и срок.`,
          ],
        },
        {
          heading: "3. Цена и оплата",
          bullets: [
            `Тарифы и цены указаны в Telegram-боте ${brand}. Оплата производится через поддерживаемые платёжные сервисы.`,
            "Доступ активируется после подтверждения оплаты.",
          ],
        },
        {
          heading: "4. Права и обязанности",
          bullets: [
            "Исполнитель обеспечивает работу сервиса и оказывает поддержку.",
            "Клиент использует сервис в соответствии с Пользовательским соглашением.",
          ],
        },
        {
          heading: "5. Возврат средств",
          paragraphs: [
            "Возврат производится при технической невозможности предоставить услугу.",
          ],
        },
        {
          heading: "6. Срок действия и расторжение",
          paragraphs: [
            "Договор действует с момента оплаты до окончания оплаченного периода и может быть расторгнут в соответствии с Пользовательским соглашением.",
          ],
        },
        {
          heading: "7. Реквизиты и контакты Исполнителя",
          bullets: [`Исполнитель: ${seller}`, `Контакт: ${CONTACT}`],
        },
      ],
      footnote: `Оформляя заказ, вы подтверждаете согласие с условиями настоящей оферты.`,
    };
  }
  return {
    title: "Public Offer",
    updated: "This offer sets out the terms on which access to the service is sold.",
    intro: `This public offer is made between ${seller} ("the Provider") and the customer.`,
    sections: [
      {
        heading: "1. General",
        bullets: [
          "This document is a public offer (a binding contract).",
          "Placing an order and/or making a payment constitutes full acceptance of these terms.",
        ],
      },
      {
        heading: "2. Subject of the offer",
        paragraphs: [
          `The Provider grants the customer paid access to the ${brand} VPN service for the selected plan and period.`,
        ],
      },
      {
        heading: "3. Price & payment",
        bullets: [
          `Plans and prices are shown in the ${brand} Telegram bot. Payment is made through supported payment providers.`,
          "Access is activated after payment is confirmed.",
        ],
      },
      {
        heading: "4. Rights & obligations",
        bullets: [
          "The Provider maintains the service and provides support.",
          "The customer uses the service in line with the User Agreement.",
        ],
      },
      {
        heading: "5. Refunds",
        paragraphs: ["Refunds are provided where the Provider is technically unable to deliver the service."],
      },
      {
        heading: "6. Term & termination",
        paragraphs: [
          "The contract is effective from payment until the end of the paid period and may be terminated in line with the User Agreement.",
        ],
      },
      {
        heading: "7. Provider details & contact",
        bullets: [`Provider: ${seller}`, `Contact: ${CONTACT}`],
      },
    ],
    footnote: `By placing an order, you agree to the terms of this offer.`,
  };
}

export function getLegalDoc(kind: LegalKind, lang: Lang): LegalDoc {
  if (kind === "policy") return policy(lang);
  if (kind === "agreement") return agreement(lang);
  return offer(lang);
}
