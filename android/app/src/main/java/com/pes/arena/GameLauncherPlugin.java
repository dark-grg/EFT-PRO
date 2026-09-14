package com.pes.arena;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GameLauncher")
public class GameLauncherPlugin extends Plugin {

    private static final String[] EFOOTBALL_PACKAGES = {
        "jp.konami.pesam",
        "jp.konami.pesactionmobile"
    };
    private static final String EFOOTBALL_SCHEME = "pesmobile://";

    @PluginMethod
    public void isGameInstalled(PluginCall call) {
        JSObject ret = new JSObject();
        PackageManager pm = getContext().getPackageManager();
        for (String pkg : EFOOTBALL_PACKAGES) {
            try {
                pm.getPackageInfo(pkg, 0);
                ret.put("installed", true);
                ret.put("packageId", pkg);
                call.resolve(ret);
                return;
            } catch (PackageManager.NameNotFoundException ignored) {
            } catch (Exception e) {
                ret.put("installed", false);
                ret.put("error", e.getMessage());
                call.resolve(ret);
                return;
            }
        }
        ret.put("installed", false);
        ret.put("packageId", EFOOTBALL_PACKAGES[0]);
        call.resolve(ret);
    }

    @PluginMethod
    public void openGame(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            PackageManager pm = getContext().getPackageManager();

            // Try launching by package ID first
            for (String pkg : EFOOTBALL_PACKAGES) {
                Intent launchIntent = pm.getLaunchIntentForPackage(pkg);
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(launchIntent);
                    ret.put("success", true);
                    ret.put("opened", true);
                    ret.put("packageId", pkg);
                    ret.put("method", "package_launch");
                    call.resolve(ret);
                    return;
                }
            }

            // Try deep link scheme
            Intent deepLinkIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(EFOOTBALL_SCHEME));
            deepLinkIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (deepLinkIntent.resolveActivity(pm) != null) {
                getContext().startActivity(deepLinkIntent);
                ret.put("success", true);
                ret.put("opened", true);
                ret.put("method", "scheme_launch");
                call.resolve(ret);
                return;
            }

            // If not found
            ret.put("success", false);
            ret.put("opened", false);
            ret.put("isInstalled", false);
            ret.put("message", "اللعبة غير مثبتة على الجهاز.");
            call.resolve(ret);

        } catch (SecurityException se) {
            ret.put("success", false);
            ret.put("opened", false);
            ret.put("error", "SECURITY_ERROR");
            ret.put("message", "Android لم يسمح بفتح التطبيق.");
            call.resolve(ret);
        } catch (Exception e) {
            ret.put("success", false);
            ret.put("opened", false);
            ret.put("error", "UNKNOWN_ERROR");
            ret.put("message", "تعذر فتح اللعبة: " + e.getMessage());
            call.resolve(ret);
        }
    }
}
