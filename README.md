# Snappit

Päivittäinen 10 sekunnin videopäiväkirja PWA. Mainokseton, kevyt ja paikallinen.

Tekijä: **Vili-Petteri** ([vili-pet](https://github.com/vili-pet)).

Snappit tallentaa lyhyet hetket tähän selaimeen (IndexedDB). Ei tilejä, ei mainoksia, ei maksullista kerrosta.

## Ominaisuudet

- 10 sekunnin kuvaus kamerasta (`getUserMedia` + `MediaRecorder`), esikatselu, uudelleenotto ja tallennus
- Tiedostotuonti, jos kamera evätään tai puuttuu
- Paikat ja geofence-herätteet sovelluksen ollessa auki, plus testattava demopaikannus
- Aikajana, suodattimet ja kalenterin lämpökartta
- Viikko- / kuukausi- / vuosikoosteet: selain yrittää koodata, muuten peräkkäinen esikatselu
- Putki, XP ja saavutukset (mm. **1st Snappit**, **Streak Starter**)
- Asennettava PWA, vaalea/tumma teema, demodata-kytkin

## Setup

Vaatii Node.js 22+.

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run lint
npm run build
npm run preview  # tuotantobuild paikallisesti
```

Kehityspalvelin ja tuotantobuild toimivat staattisina tiedostoina. Kamera ja sijainti vaativat **HTTPS** (tai `localhost`).

## Selainluvat

| Lupa | Käyttö | Pakollinen |
| --- | --- | --- |
| Kamera | 10 s kuvaus | Ei — tiedostotuonti toimii varana |
| Mikrofoni | Ääni klipissä | Ei |
| Sijainti | Paikkaherkät herätteet | Ei — demopaikannus asetuksissa |

Luvat kysytään vasta, kun avaat kameran tai kytket paikkaseurannan. Evätty lupa ei lukitse sovellusta: voit tuoda videon ja käyttää demopaikkoja.

## Privacy & permissions

- Klipit, paikat, koosteet ja pelillisyys tallennetaan **vain tähän selaimeen** IndexedDB:hen.
- Palvelimelle ei lähetetä mediaa, koordinaatteja eikä analytiikkaa.
- Käyttöliittymä näyttää paikkanimet, ei karttaa. Tarkat koordinaatit ovat piilossa, kunnes kytket ne asetuksista.
- Klippeihin liitetään korkeintaan paikkanimi, ei lat/lng-arvoa.
- Demodata on merkitty violetilla “Demodata”-tunnisteella ja voidaan poistaa ilman omien klippien häviämistä.
- Service worker välimuistittaa sovelluskuoren, ei videoklippejä.

## Rajoitukset (selain / PWA)

- **Taustakuvaus ei toimi luotettavasti.** Pidä Snappit näkyvissä kuvauksen ajan. iOS ja Android rajoittavat `getUserMedia` / `MediaRecorder` -käyttöä taustalla ja lukitulla näytöllä.
- **Taustageofence ei ole always-on.** `watchPosition` toimii kun välilehti on aktiivinen. Asennettu PWA ei saa luotettavaa taustasijaintia ilman natiivisovellusta. Testaa siirtymiä Asetukset → demopaikannus.
- Koosteiden yhteenliitos on **best-effort**: canvas + `MediaRecorder`. Jos koodaus tuottaa tyhjän tai epäonnistuneen tiedoston, UI näyttää peräkkäisen esikatselun eikä väitä onnistunutta encodea.
- Laajennuskohta raskaammalle koodaukselle: `src/lib/media.ts` → `composeMontage` voidaan vaihtaa [ffmpeg.wasm](https://ffmpegwasm.netlify.app/) - tai palvelinprosessiin.
- Tallennustila on selaintäkohtainen. Tietojen tyhjennys tai toinen selain tyhjentää päiväkirjan.

## Deploy

`npm run build` tuottaa `dist/`-kansion. Julkaise se mihin tahansa staattiseen hostiin (GitHub Pages, Netlify, Cloudflare Pages, Hostinger Static).

1. Osoita host HTTPS-domainiin.
2. Palauta `index.html` kaikille sovellusreiteille (hash-reititys `#/muistot` toimii myös ilman rewriteja).
3. Älä estä service workeria (`sw.js`) äläkä `manifest.webmanifest`-tiedostoa.
4. Tarkista kameran ja sijainnin toiminta oikealla puhelimella, ei pelkästään desktop-devtoolseissa.

Esimerkki GitHub Pages -workflowksi: buildaa `dist` ja julkaise se `gh-pages`-haarana. Sovelluksella ei ole backend-ympäristömuuttujia.

## Android-sovellus (Capacitor)

Sama web-koodi paketoidaan natiiviksi Android-sovellukseksi Capacitorilla. Web-assetit kulkevat APK:n mukana, joten sovellus toimii ilman verkkoa.

Vaatimukset: Node 22+, JDK 21, Android SDK (platform 35 + build-tools). Aseta `ANDROID_HOME` tai `android/local.properties` (`sdk.dir=...`).

```bash
npm run android:sync      # vite build + cap sync
npm run android:debug     # debug-APK: android/app/build/outputs/apk/debug/app-debug.apk
npm run android:release   # allekirjoitettu AAB + APK (vaatii keystoren)
npm run android:assets    # generoi ikonit ja splashit ikoni-SVG:stä
```

Sovellustunnus on `pet.vili.snappit`, nimi **Snappit**, näkymä lukittu pystyasentoon. Luvat kysytään ajonaikaisesti: kamera ja mikrofoni `getUserMedia`-kutsun yhteydessä, sijainti `@capacitor/geolocation`-liitännäisellä. Service workeria ei rekisteröidä natiivissa, koska APK tarjoilee assetit paikallisesti.

### Julkaisubuild ja allekirjoitus

1. Luo keystore kerran ja säilytä se repon ulkopuolella:

   ```bash
   keytool -genkeypair -v -keystore ~/snappit-release.jks -keyalg RSA -keysize 2048 \
     -validity 10000 -alias snappit
   ```

2. Luo `android/keystore.properties` (gitignoroitu):

   ```properties
   storeFile=/absolute/path/to/snappit-release.jks
   storePassword=...
   keyAlias=snappit
   keyPassword=...
   ```

3. Nosta `versionCode` ja `versionName` tiedostossa `android/app/build.gradle` ja aja `npm run android:release`. Tulokset: `android/app/build/outputs/bundle/release/app-release.aab` (Play Console) ja `android/app/build/outputs/apk/release/app-release.apk` (suora jakelu).

Ilman `keystore.properties`-tiedostoa release-buildi jää allekirjoittamatta, mutta kääntyy silti.

### Play Store

Play Console vaatii AAB:n, tietosuojaselosteen ja data safety -lomakkeen. Snappit ei lähetä dataa laitteelta, joten vastaus on "no data collected". Deklaroidut luvat: kamera, mikrofoni ja sijainti — kaikki valinnaisia sovelluksen toiminnan kannalta.

## Testit

Yksikkötestit kattavat putken ja XP:n, päiväryhmityksen, geofence-siirtymät (hysteresis) sekä koosteen jaksonvalinnan:

```bash
npm test
```

## Arkkitehtuuri

Pieni client-only Vite + React + TypeScript -sovellus.

- `src/lib/` puhdas domain (päivämäärät, streak, geofence, montage)
- `src/lib/db.ts` IndexedDB
- `src/state/AppState.tsx` paikallinen tila
- `src/views/` kuvaus, muistot, koosteet, asetukset
