from pathlib import Path

content = """{
  "page": {
    "title": "Startseite",
    "aboutTitle": "Über",
    "description": "whwdzg's personal page"
  },
  "header": {
    "homeLink": "Startseite",
    "searchBtn": "Suche",
    "themeToggleBtn": "Dunkel/Hell umschalten",
    "themeSettingsBtn": "Theme-Einstellungen",
    "languageSelectorBtn": "Sprache wählen",
    "avatarAlt": "Avatar"
  },
  "avatar": { "github": "GitHub", "bilibili": "bilibili" },
  "theme": { "followSystem": "System folgen", "manual": "Manuelle Einstellungen" },
  "language": { "zhCN": "中文（简体）", "zhTW": "中文（繁体）", "enUS": "English (US)", "ruRU": "Русский", "frFR": "Français", "deDE": "Deutsch", "jaJP": "日本語" },
  "sidebar": {
    "home": "Startseite",
    "about": "Über",
    "legacy": "Zurück zu 1.0",
    "home1_0": "Startseite (1.0)",
    "about1_0": "Über (1.0)",
    "readme1_0": "README (1.0)",
    "readme": "README",
    "column": "Spalte",
    "gallery": "Persönliche Galerie",
    "comments": "Kommentarbereich",
    "videoArchive": "Videoarchiv",
    "bilibili": "bilibili",
    "collapseBtn": "Seitenleiste ein-/ausblenden"
  },
  "search": { "placeholder": "Suchinhalt", "button": "Suchen", "ariaLabel": "Suche starten", "noResults": "Keine Ergebnisse", "resultCount": "{count} Ergebnisse gefunden", "imageTag": "[Bild]" },
  "aside": {
    "noticeTitle": "Hinweis",
    "noticeContent": "<strong>Frühe Testversion, Fehler möglich</strong>",
    "legacyTitle": "Zur 1.0-Startseite",
    "versionLabel": "Version 1.0",
    "legacyLink": "Zur 1.0-Startseite",
    "legacyStopped": "Nicht mehr aktualisiert",
    "shell": {
      "betaTitle": "Hinweis",
      "betaContent": "<strong>Frühe Testversion, Fehler möglich</strong>",
      "archivesTitle": "Zur 1.0-Startseite",
      "archivesDesc": "Version 1.0 wird nicht mehr aktualisiert",
      "archivesLink": "Zur 1.0-Startseite"
    }
  },
  "footer": {
    "copyright": "&copy; 2022-2026 whwdzg.",
    "allRights": "Alle Rechte vorbehalten.",
    "version": "Aktuelle Version: <strong>2.0.3.1-20260214</strong>"
  },
  "settings": {
    "title": "Einstellungen",
    "lightdark": { "title": "Hell/Dunkel umschalten", "subtitle": "Verhalten für hell/dunkel", "follow": "System folgen", "manual": "Manuell" },
    "color": {
      "title": "Themenfarbe wechseln",
      "subtitle": "Wähle die Akzentfarbe",
      "customLabel": "Benutzerdefiniert",
      "customPanel": {
        "title": "Benutzerdefinierte Farbe",
        "hue": "Farbton",
        "saturation": "Sättigung",
        "lightness": "Helligkeit",
        "hexPlaceholder": "#RRGGBB oder #RGB",
        "apply": "Übernehmen"
      }
    },
    "pageProgress": { "title": "Seitenfortschritt", "subtitle": "Fortschritt unter der Kopfzeile anzeigen", "off": "Aus", "on": "An" },
    "particleAnimation": { "title": "Partikel-Animation", "subtitle": "Partikelanimation auf der Seite anzeigen", "options": ["Aus","Sakura","Platane Blätter","Ginkgo Blätter","Schnee"] },
    "clearCache": {
      "title": "Seitencache leeren",
      "subtitle": "Lokalen Seitencache löschen, um sicherzustellen, dass alles aktuell ist (normalerweise nicht empfohlen)",
      "button": "Leeren",
      "buttonWorking": "Wird geleert...",
      "status": {
        "unsupported": "Ihr Browser unterstützt das Leeren des Caches nicht",
        "working": "Cache wird geleert...",
        "done": "Cache geleert, Seite wird neu geladen",
        "failed": "Leeren fehlgeschlagen, bitte erneut versuchen"
      }
    }
  },
  "buttons": { "scrollToTop": "Nach oben" },
  "lightbox": { "close": "Bild schließen", "zoomIn": "Vergrößern", "zoomOut": "Verkleinern", "download": "Bild herunterladen", "locate": "Zum Text", "prev": "Vorherige", "next": "Nächste", "fullscreen": "Vollbild", "exitFullscreen": "Vollbild verlassen", "zoomInputPlaceholder": "40-400%", "zoomInputLabel": "Zoom-Prozentsatz" }
}
"""
Path("js/i18n/de-DE.json").write_text(content, encoding="utf-8")
