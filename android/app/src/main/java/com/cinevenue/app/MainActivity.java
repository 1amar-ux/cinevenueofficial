package com.cinevenue.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure the WebView decor fits system windows so status bar and navigation bar never collide with the app UI
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, true);

        // Set status bar & navigation bar background colors to match CineVenue luxury dark theme
        int darkBg = Color.parseColor("#0A0A0B");
        window.setStatusBarColor(darkBg);
        window.setNavigationBarColor(darkBg);

        // Ensure status bar text and icons (clock, battery, Wi-Fi) remain clearly visible in light/white
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }
    }
}
