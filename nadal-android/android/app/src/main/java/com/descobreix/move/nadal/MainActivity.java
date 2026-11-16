package com.descobreix.move.nadal;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CalendarExportPlugin.class);
        super.onCreate(savedInstanceState);
        String userAgent = getBridge().getWebView().getSettings().getUserAgentString();
        getBridge().getWebView().getSettings().setUserAgentString(userAgent + " MoveNadal/1.0");
    }
}
