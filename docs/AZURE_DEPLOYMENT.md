# Azure Deployment Guide — Option B

**Architecture**

- **Frontend** → Azure **Static Web Apps** (Free) — builds `frontend/` (Vite) with global CDN + free TLS.
- **API** → Azure **App Service** (Linux, Node 20) — runs the Express backend only.
- **Database** → existing **MongoDB Atlas**.

The frontend and API are on **different origins**, so CORS must allow the SWA URL (handled via `CORS_ORIGIN`).

---

## 0. Prerequisites & secret rotation (do first)

> ⚠️ The values that were in `backend/.env` are considered **compromised**. Rotate them before deploying.

1. **MongoDB Atlas** → Database Access → reset the DB user's password.
2. Generate a strong JWT secret (PowerShell):
   ```powershell
   [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
   ```
3. Ensure `az` CLI is installed and run `az login`.
4. Select your subscription:
   ```powershell
   az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"
   ```

---

## 1. Variables (PowerShell)

```powershell
$RG   = "rg-stp-app"
$LOC  = "eastus"
$PLAN = "plan-stp-api"
$API  = "stp-api-$(Get-Random -Max 9999)"   # must be globally unique
$WEB  = "stp-web"

$JWT_SECRET  = "<paste-new-strong-secret>"
$MONGODB_URI = "<paste-rotated-atlas-uri>"
```

---

## 2. Provision & deploy the API (App Service)

```powershell
az group create -n $RG -l $LOC

az appservice plan create -g $RG -n $PLAN --is-linux --sku B1

az webapp create -g $RG -p $PLAN -n $API --runtime "NODE:20-lts"

# App settings (secrets + config). CORS_ORIGIN is a placeholder until the SWA exists.
az webapp config appsettings set -g $RG -n $API --settings `
  NODE_ENV=production `
  JWT_SECRET="$JWT_SECRET" `
  JWT_EXPIRE="7d" `
  MONGODB_URI="$MONGODB_URI" `
  CORS_ORIGIN="https://placeholder.azurestaticapps.net" `
  WEBSITE_NODE_DEFAULT_VERSION="~20"

# Express entry point
az webapp config set -g $RG -n $API --startup-file "node server.js"

# Deploy the backend folder as a zip
Compress-Archive -Path .\backend\* -DestinationPath api.zip -Force
az webapp deploy -g $RG -n $API --src-path api.zip --type zip
```

**Test the API:**

```powershell
Invoke-RestMethod "https://$API.azurewebsites.net/api/health"
```

**Allow App Service to reach Atlas** — add these outbound IPs to the Atlas IP allowlist
(Atlas → Network Access), or temporarily `0.0.0.0/0`:

```powershell
az webapp show -g $RG -n $API --query outboundIpAddresses -o tsv
```

---

## 3. Provision the frontend (Static Web Apps)

### Option 3a — Linked to GitHub (auto CI/CD)

```powershell
az staticwebapp create -n $WEB -g $RG -l $LOC `
  --source "https://github.com/<you>/<repo>" --branch main `
  --app-location "/frontend" --output-location "dist" `
  --login-with-github
```

Then add the build-time API URL as an env var used by the workflow (`VITE_API_URL`).
This repo already includes `.github/workflows/azure-static-web-apps.yml`; add these repo secrets:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` — from the SWA (Portal → the SWA → Manage deployment token).
- `VITE_API_URL` = `https://<API>.azurewebsites.net`

### Option 3b — Deploy without GitHub (SWA CLI)

```powershell
npm i -g @azure/static-web-apps-cli
# Build locally with the API URL baked in:
$env:VITE_API_URL = "https://$API.azurewebsites.net"
npm --prefix .\frontend ci
npm --prefix .\frontend run build
# Create the SWA (no repo) then deploy the dist folder:
az staticwebapp create -n $WEB -g $RG -l $LOC
$deployToken = az staticwebapp secrets list -n $WEB -g $RG --query "properties.apiKey" -o tsv
swa deploy .\frontend\dist --deployment-token $deployToken --env production
```

Get the SWA URL:

```powershell
az staticwebapp show -n $WEB -g $RG --query "defaultHostname" -o tsv
```

---

## 4. Wire the two together (CORS)

Set the API's `CORS_ORIGIN` to the **real** SWA URL, then restart:

```powershell
$SWA_URL = "https://$(az staticwebapp show -n $WEB -g $RG --query defaultHostname -o tsv)"
az webapp config appsettings set -g $RG -n $API --settings CORS_ORIGIN="$SWA_URL"
az webapp restart -g $RG -n $API
```

If you changed `VITE_API_URL` after the first SWA build, re-run the SWA build
(push a commit, or re-run `swa deploy`).

---

## 5. Verify

- API health: `https://<API>.azurewebsites.net/api/health` → `{ "status": "success" }`
- Open the SWA URL → Register/Login → confirm no CORS errors in DevTools → create a trip.

---

## 6. Post-deploy hardening (recommended)

- Move secrets to **Azure Key Vault**; enable App Service **Managed Identity** + Key Vault references.
- App Service → **HTTPS Only = On**, **Always On = On** (B1+).
- Enable **Application Insights** for logs/metrics.
- Tighten the Atlas IP allowlist to the App Service outbound IPs (avoid `0.0.0.0/0`).
- Add a **custom domain** + free **Managed Certificate** on both SWA and App Service.

---

## GitHub Actions (already in this repo)

- `.github/workflows/azure-static-web-apps.yml` — builds & deploys `frontend/` to SWA.
  - Secrets: `AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_API_URL`.
- `.github/workflows/azure-api.yml` — deploys `backend/` to App Service.
  - Secrets: `AZURE_API_APP_NAME`, `AZURE_API_PUBLISH_PROFILE`
    (get profile: `az webapp deployment list-publishing-profiles -g $RG -n $API --xml`).
