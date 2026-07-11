package app.auftragsverwaltung;

/*
 * Auftragsverwaltung für Handwerk, Transport & Umzug — Android-App.
 *
 * Die komplette Oberfläche (index.html) steckt als Asset in der App und
 * wird unter https://app.local/ ausgeliefert (sicherer Ursprung, damit
 * localStorage und IndexedDB zuverlässig funktionieren). Die App startet
 * dadurch auch ohne Heimnetz sofort; synchronisiert wird über die in den
 * Einstellungen hinterlegte PC-Adresse (CORS-freigegeben im PC-Programm).
 */

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    private static final String START_URL = "https://app.local/index.html";
    private static final int DATEIWAHL_CODE = 4711;

    private WebView webView;
    private ValueCallback<Uri[]> dateiwahlRueckgabe;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle sicherung) {
        super.onCreate(sicherung);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings einstellungen = webView.getSettings();
        einstellungen.setJavaScriptEnabled(true);
        einstellungen.setDomStorageEnabled(true);
        einstellungen.setDatabaseEnabled(true);
        // Seite kommt von https://app.local, die PC-API über http://192.168.… —
        // dieser Mix ist im Heimnetz gewollt
        einstellungen.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        // Erkennungsmerkmal für die App-Betriebsart der Oberfläche
        einstellungen.setUserAgentString(einstellungen.getUserAgentString() + " AuftragsApp");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView ansicht, WebResourceRequest anfrage) {
                Uri adresse = anfrage.getUrl();
                if (!"app.local".equals(adresse.getHost())) return null;
                String pfad = adresse.getPath();
                if (pfad == null || pfad.equals("/")) pfad = "/index.html";
                try {
                    InputStream inhalt = getAssets().open(pfad.substring(1));
                    return new WebResourceResponse(inhaltstyp(pfad), "utf-8", inhalt);
                } catch (IOException fehler) {
                    Map<String, String> leer = new HashMap<>();
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                            leer, new ByteArrayInputStream(new byte[0]));
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView ansicht, ValueCallback<Uri[]> rueckgabe,
                                             FileChooserParams parameter) {
                if (dateiwahlRueckgabe != null) dateiwahlRueckgabe.onReceiveValue(null);
                dateiwahlRueckgabe = rueckgabe;
                try {
                    startActivityForResult(parameter.createIntent(), DATEIWAHL_CODE);
                } catch (Exception fehler) {
                    dateiwahlRueckgabe = null;
                    rueckgabe.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });

        webView.loadUrl(START_URL);
    }

    private static String inhaltstyp(String pfad) {
        if (pfad.endsWith(".html")) return "text/html";
        if (pfad.endsWith(".png")) return "image/png";
        if (pfad.endsWith(".js")) return "text/javascript";
        if (pfad.endsWith(".css")) return "text/css";
        return "application/octet-stream";
    }

    @Override
    protected void onActivityResult(int code, int ergebnis, Intent daten) {
        if (code == DATEIWAHL_CODE && dateiwahlRueckgabe != null) {
            dateiwahlRueckgabe.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(ergebnis, daten));
            dateiwahlRueckgabe = null;
            return;
        }
        super.onActivityResult(code, ergebnis, daten);
    }

    // Zurück-Taste: erst offene Dialoge/Großansicht in der Oberfläche schließen,
    // erst danach die App verlassen
    @Override
    public void onBackPressed() {
        webView.evaluateJavascript(
                "(function(){" +
                "var lb=document.getElementById('lightbox');" +
                "if(lb&&lb.classList.contains('offen')){lb.classList.remove('offen');return 'zu';}" +
                "if(window.dialog2&&dialog2.open){dialog2.close();return 'zu';}" +
                "if(window.dialog&&dialog.open){dialog.close();return 'zu';}" +
                "return 'ende';})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String wert) {
                        if (wert == null || !wert.contains("zu")) finish();
                    }
                });
    }
}
