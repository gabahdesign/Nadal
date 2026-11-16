package com.descobreix.move.nadal;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "CalendarExport")
public class CalendarExportPlugin extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        String content = call.getString("content");
        String filename = call.getString("filename", "activitat.ics");
        if (content == null || content.isEmpty()) {
            call.reject("Falta el contingut del calendari.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("text/calendar");
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(call, intent, "savedCalendar");
    }

    @ActivityCallback
    private void savedCalendar(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent resultData = result.getData();
        Uri uri = resultData == null ? null : resultData.getData();
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            response.put("saved", false);
            call.resolve(response);
            return;
        }
        try (OutputStream stream = getContext().getContentResolver().openOutputStream(uri)) {
            if (stream == null) throw new java.io.IOException("No es pot obrir el fitxer.");
            stream.write(call.getString("content", "").getBytes(StandardCharsets.UTF_8));
            response.put("saved", true);
            call.resolve(response);
        } catch (Exception error) {
            call.reject("No s'ha pogut desar el calendari.", error);
        }
    }
}
