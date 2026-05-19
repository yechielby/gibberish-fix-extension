<div align="center">

# ⌨️ GibberishFix

**Typed in the wrong keyboard layout? Fix it with one keystroke — anywhere in your IDE.**

![Languages](https://img.shields.io/badge/languages-32%2B-orange)
![Platform](https://img.shields.io/badge/works%20in-any%20VS%20Code--based%20IDE-007ACC)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Open VSX](https://img.shields.io/open-vsx/v/yechielby/gibberish-fix?label=Open%20VSX&color=c160ef)](https://open-vsx.org/extension/yechielby/gibberish-fix)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/yechielby.gibberish-fix?label=VS%20Code%20Marketplace&logo=visualstudiocode&color=107c10)](https://marketplace.visualstudio.com/items?itemName=yechielby.gibberish-fix)


**🇬🇧 [English](#english)  ·  🇮🇱 [עברית](#hebrew)**

</div>

---

<a id="english"></a>

## English

### 🤔 The problem

You start typing — fast, without looking — and only after a full sentence
you notice the keyboard was on the wrong layout. Instead of real text you
get gibberish: `tbh rumv kgau,` instead of `אני רוצה לעשות`, `ghbdtn`
instead of `привет`, `dkssud` instead of `안녕`. Every language has a name
for this mess, and every developer loses their train of thought retyping it.

**GibberishFix** fixes it with one keystroke — and on Windows it also
switches your OS keyboard to match, so you just keep typing.

### 🖥️ Where it works

GibberishFix works in **any VS Code‑based editor** — VS Code itself, as well
as forks and AI‑first IDEs such as **Cursor**, **Windsurf**, **VSCodium**,
**Antigravity**, and similar.

Inside those editors it works in places most tools can't reach:

| Surface | Supported |
|---|---|
| Code editor & multi‑cursor selections | ✅ |
| Search / replace & Quick Open boxes | ✅ |
| **AI chat panels** — Claude Code, GitHub Copilot Chat, Cursor AI, Antigravity, Gemini Code Assist | ✅ |

It reaches webview chat panels through a clipboard‑relay pipeline
(cut → convert → paste → switch OS keyboard) — the one mechanism that
penetrates extension webviews.

### 🚀 Usage

Select the gibberish text (or select nothing — it converts the whole input)
and press one of:

| Shortcut | Behavior |
|---|---|
| **`Alt+Shift+L`** | **Auto / mixed** — every character is converted by its *own* script. Latin → target and target → English happen at once, so mixed gibberish like `vna,bv ... ארוק` becomes `המשתנה ... true`. |
| **`Alt+Shift+E`** | **All to English** — target‑script characters → English; text already in English is left untouched. |
| **`Alt+Shift+T`** | **All to target** — English → the target language; text already in the target script is left untouched. |

**Rule of thumb:** use `Alt+Shift+L` when you typed without looking and the
mess could go either way; use the forced commands when you want the whole
input collapsed into one script. Rebind any shortcut via
**VS Code → Keyboard Shortcuts → search "GibberishFix"**.

### 🎯 Choosing the target language

By default `targetLanguage` is `auto`: GibberishFix looks at which
keyboard layouts — other than English — are installed in your OS
(Windows), and uses them as the target:

- only one such layout installed → that one is the target;
- two or more → the language you last converted to (remembered
  automatically), or the first detected one until then.

The active target is always shown in the **status bar** as
`⌨️ <language>`. Click it — or run **GibberishFix: Choose Target
Language** from the Command Palette — to pick any of the 32 languages
explicitly. Picking one **pins** it: this sets `targetLanguage` to your
choice and turns auto‑detection off. Set it back to `auto` in Settings to
re‑enable detection.

### ⚙️ Settings

| Setting | Default | What it does |
|---|---|---|
| `gibberish-fix.targetLanguage` | `auto` | The target language. `auto` detects it from your installed OS keyboards; picking a language from the status bar pins it instead. See [Choosing the target language](#choosing-the-target-language). |
| `gibberish-fix.switchOSKeyboard` | `true` | After converting, switch the Windows keyboard layout to match (so you keep typing seamlessly). |
| `gibberish-fix.convertDigits` | `true` | Convert digits too — important for languages with native digits (Farsi, Bengali, …). |
| `gibberish-fix.selectAllIfNoSelection` | `true` | With no selection, convert the entire input field instead of doing nothing. |

### 🌐 Supported languages

GibberishFix supports all **32 languages** below, auto‑generated from
[simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts).
Every example is computed mechanically from the real layout data — column 3
shows exactly what you get.

| | Language | Examples | Local expression for the mistake |
|---|---|---|---|
| 🇮🇱 | Hebrew (עברית) | 1. `akuo` → `שלום`<br>2. `ארוק` → `true` | Typing «שכחתי להעביר שפה» (forgot to switch language) or «מקלדת הפוכה» (flipped keyboard); the result is «ג׳יבריש» (gibberish). |
| 🇷🇺 | Russian (русский) | 1. `ghndtm` → `привет`<br>2. `екгу` → `true` | Typing «не в той раскладке» (in the wrong layout); the result is jokingly «кракозя́бры» (krakozyabry). |
| 🇺🇦 | Ukrainian (українська) | 1. `ghndsm` → `привіт`<br>2. `екгу` → `true` | Typing «не в тій розкладці» (in the wrong layout) or «забув змінити мову» (forgot to change language); the result is «кракозябри». |
| 🇧🇾 | Belarusian (беларуская) | 1. `ghsdbnfyyt` → `прывітанне`<br>2. `екгу` → `true` | Typing «не ў той раскладцы» (in the wrong layout); the result is «краказябры». |
| 🇰🇷 | Korean (한국어) | `ᄉ겨ᄃ` → `true` | Typing «한영 오타» (Han-Yeong typo) or «영타» (typing in English layout); the result is playfully called «외계어» (alien language). |
| 🇯🇵 | Japanese (日本語) | 1. `byiaf` → `こんにちは`<br>2. `かすない` → `true` | Typing «IMEオフのまま» (leaving the IME off) or «ローマ字入力» (typing in Romaji layout by mistake); the result is «打ち間違い» (typing error). |
| 🇹🇭 | Thai (ไทย) | `ะพีำ` → `true` | Typing «ลืมเปลี่ยนภาษา» (forgot to change the language); the result is famously called «ภาษาต่างดาว» (alien language). |
| 🇬🇷 | Greek (Ελληνικά) | 1. `geia` → `γεια`<br>2. `τρθε` → `true` | Typing «ξέχασα να γυρίσω το πληκτρολόγιο» (forgot to switch the keyboard); the result is called «αλαμπουρνέζικα» (gibberish / gobbledygook). |
| 🇸🇦 | Arabic (العربية) | 1. `lvpfh` → `مرحبا`<br>2. `فقعث` → `true` | Typing «نسيت أحول اللغة» (I forgot to change the language); the result is often called «طلاسم» (talismans / indecipherable text). |
| 🇮🇷 | Persian / Farsi (فارسی) | 1. `sghl` → `سلام`<br>2. `فقعث` → `true` | Typing «کیبورد انگلیسی بود» (the keyboard was on English); the result is called «خرچنگ قورباغه» (crabs and frogs — messy, unreadable scribble). |
| 🇲🇰 | Macedonian (македонски) | 1. `zdravo` → `здраво`<br>2. `труе` → `true` | Typing «грешна тастатура» (wrong keyboard layout); the result is called «хиероглифи» (hieroglyphs). |
| 🇬🇪 | Georgian (ქართული) | 1. `gamarjoba` → `გამარჯობა`<br>2. `ტრუე` → `true` | Typing «არასწორი განლაგება» (wrong layout) or «ინგლისურად დამრჩა» (left it in English); the result is called «იეროგლიფები» (hieroglyphs). |
| 🇦🇲 | Armenian – Eastern (հայերեն) | `տրըէ` → `true` | Typing «սխալ ստեղնաշար» (wrong keyboard); the result is jokingly called «անհասկանալի տեքստ» (unintelligible text). |
| 🇦🇲 | Armenian – Western (հայերէն) | `դրըէ` → `true` | Typing «սխալ ստեղնաշար» (wrong keyboard); the result is called «խառնակ գիր» (jumbled writing). |
| 🇵🇰 | Urdu (اردو) | 1. `slam` → `سلام`<br>2. `ترءع` → `true` | Typing «غلط کی بورڈ» (wrong keyboard) or «زبان بدلنا بھول گیا» (forgot to change language); the result is «مہمل الفاظ» (nonsense words). |
| 🇵🇰 | Urdu – Standard (اردو) | 1. `jdrs` → `اردو`<br>2. `ٹدتھ` → `true` | Typing «غلط کی بورڈ» (wrong keyboard) or «زبان بدلنا بھول گیا» (forgot to change language); the result is «مہمل الفاظ» (nonsense words). |
| 🇲🇲 | Burmese (မြန်မာ) | `အမကန` → `true` | Typing «ကီးဘုတ်မှားနေတယ်» (the keyboard is wrong); the result is «စာလွဲ» (misaligned / jumbled text). |
| 🇮🇷 | Gilaki (گیلکی) | `فقعئ` → `true` | Typing «کیبورد عوض نبوو» (the keyboard wasn’t changed); the result is also called «خرچنگ قورباغه». |
| 🇮🇶 | Kurdish – Sorani (کوردی) | `ترئە` → `true` | Typing «تەختەکلیلەکە ھەڵەیە» (the keyboard is wrong); the result is «تێکەڵ و پێکەڵ» (jumbled up). |
| 🇵🇰 | Sindhi (سنڌي) | `ترءع` → `true` | Typing «غلط ڪيبورڊ» (wrong keyboard layout); the result is «گڑبڑ» (jumbled / mess). |
| 🇵🇰 | Balochi (بلۏچی) | `ترءع` → `true` | Typing «کیبورد مٹ نہ کتگ» (forgot to switch keyboard); the result is «رد و بند» (mixed-up nonsense). |
| 🇨🇳 | Uyghur (ئۇيغۇرچە) | `ترۇې` → `true` | Typing «بۇسۇنتاختا خاتا» (wrong keyboard layout); the result is «چۈشەنگىسىز خەت» (unintelligible writing). |
| 🇮🇳 | Hindi (हिन्दी) | 1. `cxndls` → `नमस्ते`<br>2. `ूीहा` → `true` | Typing «गलत कीबोर्ड लेआउट» (wrong keyboard layout) or «अंग्रेज़ी में टाइप हो गया» (typed in English by mistake); the result is «कचरा टेक्स्ट» (garbage text) or «जिब्रिश». |
| 🇧🇩 | Bengali (বাংলা) | `িাোে` → `true` | Typing «ভুল কীবোর্ড লেআউট» (wrong keyboard layout); the result is «হিব্রি-জিব্রি» (hibri-jibri / gibberish). |
| 🇮🇳 | Punjabi – Gurmukhi (ਪੰਜਾਬੀ) | 1. `hxpeyr` → `ਪੰਜਾਬੀ`<br>2. `ੂੀਹਾ` → `true` | Typing «ਗਲਤ ਕੀਬੋਰਡ ਲੇਆਉਟ» (wrong keyboard layout); the result is «ਗੜਬੜ ਲਿਖਤ» (messed-up writing). |
| 🇮🇳 | Assamese (অসমীয়া) | 1. `cxnsjeh` → `নমস্কাৰ`<br>2. `ূীহা` → `true` | Typing «ভুল কীবৰ্ড লেআউট» (wrong keyboard layout); the result is «অস্পষ্ট পাঠ» (unclear text). |
| 🇮🇳 | Odia (ଓଡ଼ିଆ) | 1. `vcmdkej` → `ନମସ୍କାର`<br>2. `ୂୀବା` → `true` | Typing «ଭୁଲ କିବୋର୍ଡ଼ ଲେଆଉଟ୍» (wrong keyboard layout); the result is «ଗିବ୍ରିଶ୍» (gibberish). |
| 🇮🇳 | Telugu (తెలుగు) | `ూీహా` → `true` | Typing «తప్పు కీబోర్డ్ లేఅవుట్» (wrong keyboard layout); the result is «పిచ్చి రాతలు» (crazy / nonsense writing). |
| 🇮🇳 | Kannada (ಕನ್ನಡ) | 1. `vcmsjeh` → `ನಮಸ್ಕಾರ`<br>2. `ೂೀಹಾ` → `true` | Typing «ತಪ್ಪು ಕೀಬೋರ್ಡ್ ಲೇಔಟ್» (wrong keyboard layout); the result is «ಗೀಚುಬರಹ» (scribble / gibberish). |
| 🇮🇳 | Malayalam (മലയാളം) | `ഊഈങആ` → `true` | Typing «തെറ്റായ കീബോർഡ് ലേഔട്ട്» (wrong keyboard layout); the result is «കിറുക്കൻ എഴുത്ത്» (crazy / unreadable text). |
| 🇷🇺 | Russian – Old orthography (русскій) | `екгу` → `true` | Typing «не в той раскладке» (in the wrong layout); the result is «дореволюціонныя кракозябры» (pre-revolutionary krakozyabry). |
| 🇬🇳 | N'Ko (ߒߞߏ) | 1. `qkx` → `ߒߞߏ`<br>2. `ߕߙߎߋ` → `true` | Typing «ߛߓߍߘ߲ߊ߫ ߝߎ߬ߕߎ߲߬ߜߊ߬ߣߍ߲» (wrong keyboard layout); the result is «ߡߊ߬ߛߊ߲߬ߜߊ߲߬ߣߍ߲» (jumbled / confused text). |

> Some scripts (Korean, several Indic and rare Arabic‑based ones) compose
> letters from multiple keys, so a clean *latin → word* example can't be
> shown — those rows keep only the `→ true` example.

### 🧩 My other extensions

GibberishFix **fixes the text you typed**. These companion extensions
**fix how right‑to‑left text is displayed** in each AI chat panel — they're
separate, complementary tools:

| Extension | What it does | Install |
|---|---|---|
| **Claude Code RTL** | Proper RTL rendering for the Claude Code chat panel. | [Open VSX](https://open-vsx.org/extension/yechielby/claude-code-rtl) |
| **Copilot Chat RTL** | Proper RTL rendering for GitHub Copilot Chat. | [Open VSX](https://open-vsx.org/extension/yechielby/copilot-chat-rtl) |
| **Cursor Chat RTL** | Proper RTL rendering for Cursor's AI chat. | [Open VSX](https://open-vsx.org/extension/yechielby/cursor-chat-rtl) |
| **Gemini Code Assist RTL** | Proper RTL rendering for Gemini Code Assist. | [Open VSX](https://open-vsx.org/extension/yechielby/gemini-code-assist-rtl) |
| **Antigravity Chat RTL** | Proper RTL rendering for Antigravity's chat. | [Open VSX](https://open-vsx.org/extension/yechielby/antigravity-chat-rtl) |

### 📄 Credits & license

The language layouts are sourced from
[simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts)
by Francisco Hodge, under the MIT License. GibberishFix itself is released
under the [MIT License](LICENSE).

---

<div dir="rtl" align="right">
<a id="hebrew"></a>

## עברית

### 🤔 הבעיה

מתחילים להקליד — מהר, בלי להסתכל — ורק אחרי משפט שלם שמים לב שהמקלדת
הייתה על ה‑layout הלא נכון. במקום טקסט אמיתי יוצא ג'יבריש: `tbh rumv kgau,`
במקום `אני רוצה לעשות`, או `ארוק` במקום `true`. לכל שפה יש שם משלה לבלגן
הזה, וכל מפתח/ת מאבד/ת את חוט המחשבה בזמן ההקלדה מחדש.

**GibberishFix** מתקן את זה בלחיצה אחת — ובמערכת Windows גם מחליף את שפת
המקלדת של מערכת ההפעלה בהתאם, כך שפשוט ממשיכים להקליד.

### איפה זה עובד

GibberishFix עובד **בכל עורך מבוסס VS Code** — גם ב‑VS Code עצמו וגם
ב‑forks וב‑IDEs ממוקדי‑AI כמו **Cursor**, **Windsurf**, **VSCodium**,
**Antigravity** ועוד.

בתוך אותם עורכים זה עובד במקומות שרוב הכלים לא מגיעים אליהם:

| משטח | נתמך |
|---|---|
| עורך הקוד וריבוי סמנים | ✅ |
| תיבות חיפוש/החלפה ו‑Quick Open | ✅ |
| **פאנלי צ'אט AI** — Claude Code, GitHub Copilot Chat, Cursor AI, Antigravity, Gemini Code Assist | ✅ |

ההגעה לפאנלי הצ'אט (webview) נעשית דרך מנגנון "ממסר לוח" — גזירה ← המרה ←
הדבקה ← החלפת מקלדת — המנגנון היחיד שחודר ל‑webview של תוספים.

### שימוש

יש לסמן את הטקסט המשובש (או לא לסמן כלום — אז כל הקלט יומר) וללחוץ על אחד מ:

| קיצור | התנהגות |
|---|---|
| **`Alt+Shift+L`** | **אוטומטי / מעורב** — כל תו מומר לפי הסקריפט שלו עצמו. Latin ← שפת היעד ושפת היעד ← אנגלית קורים בו‑זמנית, כך שטקסט מעורב כמו `vna,bv ... ארוק` הופך ל‑`המשתנה ... true`. |
| **`Alt+Shift+E`** | **הכל לאנגלית** — תווי שפת היעד ← אנגלית; טקסט שכבר באנגלית נשאר כפי שהוא. |
| **`Alt+Shift+T`** | **הכל לשפת היעד** — אנגלית ← שפת היעד; טקסט שכבר בשפת היעד נשאר כפי שהוא. |

**כלל אצבע:** להשתמש ב‑`Alt+Shift+L` כשהקלדת בלי להסתכל והבלגן יכול להיות
בשני הכיוונים; להשתמש בפקודות הכפויות כשרוצים לרכז את כל הקלט לסקריפט אחד.

ניתן לשנות כל קיצור דרך הגדרת מקשי הקיצור של VS Code: פותחים את
**Keyboard Shortcuts** (קיצור: `Ctrl+K Ctrl+S`), מחפשים "GibberishFix"
ומשנים את הקיצור הרצוי.

### בחירת שפת היעד

כברירת מחדל `targetLanguage` מוגדר ל‑`auto`: GibberishFix בודק אילו
פריסות מקלדת — מלבד אנגלית — מותקנות במערכת ההפעלה (Windows), ומשתמש בהן
כשפת היעד:

- מותקנת פריסה אחת בלבד כזו ← היא שפת היעד;
- מותקנות שתיים או יותר ← השפה שאליה המרת לאחרונה (נשמרת אוטומטית), או
  הראשונה שזוהתה עד אז.

שפת היעד הפעילה מוצגת תמיד ב**שורת הסטטוס** בתור `⌨️ <שפה>`. לחיצה עליה —
או הרצת **GibberishFix: Choose Target Language** מתוך ה‑Command Palette —
פותחת בחירה מפורשת מבין 32 השפות. בחירת שפה **מקבעת** אותה: ההגדרה
`targetLanguage` מתעדכנת לבחירה שלך והזיהוי האוטומטי מבוטל. כדי להחזיר את
הזיהוי, יש להחזיר את ההגדרה ל‑`auto`.

### הגדרות

| הגדרה | ברירת מחדל | מה היא עושה |
|---|---|---|
| `gibberish-fix.targetLanguage` | `auto` | שפת היעד. `auto` מזהה אותה לפי מקלדות ה‑OS המותקנות; בחירת שפה משורת הסטטוס מקבעת אותה במקום. ראו «בחירת שפת היעד» למעלה. |
| `gibberish-fix.switchOSKeyboard` | `true` | אחרי ההמרה — להחליף את פריסת המקלדת ב‑Windows בהתאם (כדי שתמשיך/י להקליד ברצף). |
| `gibberish-fix.convertDigits` | `true` | להמיר גם ספרות — חשוב לשפות עם ספרות מקומיות (פרסית, בנגלית ועוד). |
| `gibberish-fix.selectAllIfNoSelection` | `true` | כשאין סימון — להמיר את כל שדה הקלט במקום לא לעשות כלום. |

### שפות נתמכות

GibberishFix תומך בכל **32 השפות** הבאות, שנוצרות אוטומטית
מתוך [simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts)
(הדוגמאות המלאות לכל שפה מופיעות בטבלה בקטע האנגלי למעלה):

עברית · רוסית · אוקראינית · בלארוסית · קוריאנית · יפנית · תאית ·
יוונית · ערבית · פרסית · מקדונית · גאורגית · ארמנית (מזרחית) ·
ארמנית (מערבית) · אורדו · אורדו (תקני) · בורמזית · גילקי ·
כורדית (סוראני) · סינדי · בלוצ'י · אויגורית · הינדי · בנגלית ·
פנג'אבי (גורמוקי) · אסאמית · אודיה · טלוגו · קנאדה · מליאלאם ·
רוסית (כתיב ישן) · נְקוֹ

### התוספים הנוספים שלי

GibberishFix **מתקן את הטקסט שהקלדת**. התוספים הנלווים הבאים **מתקנים את
האופן שבו טקסט מימין‑לשמאל מוצג** בכל פאנל צ'אט של AI — אלה כלים נפרדים
ומשלימים:

| תוסף | מה הוא עושה | התקנה |
|---|---|---|
| **Claude Code RTL** | תצוגת RTL תקינה לפאנל הצ'אט של Claude Code. | [Open VSX](https://open-vsx.org/extension/yechielby/claude-code-rtl) |
| **Copilot Chat RTL** | תצוגת RTL תקינה ל‑GitHub Copilot Chat. | [Open VSX](https://open-vsx.org/extension/yechielby/copilot-chat-rtl) |
| **Cursor Chat RTL** | תצוגת RTL תקינה לצ'אט ה‑AI של Cursor. | [Open VSX](https://open-vsx.org/extension/yechielby/cursor-chat-rtl) |
| **Gemini Code Assist RTL** | תצוגת RTL תקינה ל‑Gemini Code Assist. | [Open VSX](https://open-vsx.org/extension/yechielby/gemini-code-assist-rtl) |
| **Antigravity Chat RTL** | תצוגת RTL תקינה לצ'אט של Antigravity. | [Open VSX](https://open-vsx.org/extension/yechielby/antigravity-chat-rtl) |

</div>
