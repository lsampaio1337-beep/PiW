cat << 'INNER_EOF' > patch2.diff
--- src/ui/calendar.js
+++ src/ui/calendar.js
@@ -231,7 +231,7 @@

     html += \`</div></div>\`;

-    showModal("Calendar", html, "window-calendar", "800px", "auto");
+    showModal(titleHtml, html, "window-calendar", "800px", "auto");

     // Bind to window for tab switching
     window.showCalendar = showCalendar;
INNER_EOF
patch -p0 < patch2.diff
