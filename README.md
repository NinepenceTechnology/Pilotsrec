<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Pilot's Records

Sistema multiplataforma de gestão de pilotagem, construído com React, Vite e TypeScript.
O mesmo frontend pode ser executado no navegador, empacotado como aplicativo desktop
(Windows, macOS e Linux) e distribuído como aplicativo mobile (Android e iOS).

## Desenvolvimento web

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

## Validação

```bash
npm run lint
npm run build
```

## Desktop: EXE, DMG e AppImage

O Electron fornece o shell desktop e o electron-builder gera os instaladores.
Para desenvolvimento:

```bash
npm run desktop:dev
```

Para gerar o formato da máquina atual:

```bash
npm run desktop:build
```

Os scripts `desktop:build:win`, `desktop:build:mac` e `desktop:build:linux` devem ser
executados no sistema operacional de destino ou em CI com os toolchains dessa plataforma.

## Mobile: APK e iOS

Capacitor exige Android Studio + Android SDK para Android e Xcode + CocoaPods para iOS.
Na primeira configuração, crie as plataformas nativas:

```bash
npx cap add android
npx cap add ios
```

Depois, sincronize o frontend e abra o projeto nativo:

```bash
npm run mobile:android
npm run mobile:ios
```

O APK assinado/debug é gerado pelo Gradle dentro do projeto `android/`; a distribuição
de produção deve usar uma keystore própria. O build iOS deve ser assinado no Xcode.

## Próximas melhorias recomendadas

- substituir `localStorage` por uma camada de persistência com SQLite/IndexedDB para dados operacionais maiores;
- adicionar sincronização com API e autenticação antes de uso multiutilizador;
- proteger chaves e integrações externas através de backend, nunca dentro do bundle mobile/desktop;
- criar testes de domínio para transições de manobra, incidentes e geração de certificados PDF;
- configurar CI para gerar artefatos por sistema operacional e publicar checksums.
