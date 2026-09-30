cat << 'INNER_EOF' > patch.diff
--- src/ui/tokenShop.js
+++ src/ui/tokenShop.js
@@ -165,10 +165,10 @@
 window.buyTokenItem = function(itemType) {
     if (itemType === 'masterball') {
         handleTokenPurchase(10, () => {
-            if (!state.backpack.pokeballs["Masterball"]) {
-                state.backpack.pokeballs["Masterball"] = 0;
+            if (!state.backpack.pokeballs["Masterball"]) {
+                state.backpack.pokeballs["Masterball"] = 0;
             }
-            state.backpack.pokeballs["Masterball"] += 1;
+            state.backpack.pokeballs["Masterball"] += 1;
             if (window.showGameAlert) window.showGameAlert("Bought 1x Masterball!");
         });
     }
INNER_EOF
patch -p0 < patch.diff
