# Platform Deployment Guide: Zoho Catalyst AppSail

Deploying the KSP Crime Analytics platform via **Zoho Catalyst AppSail** means building a dedicated, secure middle-tier web service. 

Because hosting 30B+ parameter model weights (like Gemma 4 31B) directly inside a serverless runtime causes immense cold starts and exceeds typical function memory ceilings, AppSail acts as your platform's backend router. It securely manages business logic, routes raw text to an external secure inference endpoint, saves relational data to Neo4j, and pushes geospatial clusters to the map UI.

---

## 🏗️ The Secure Architecture

```
[ Frontend: Mapbox / Neo4j UI ]
               │
               ▼  (Secure HTTPS API Call)
 ┌───────────────────────────────────────────┐
 │       ZOHO CATALYST APPSAIL LAYER         │
 │   - Authentication & Access Control       │
 │   - Data Pipeline Middleware              │
 └─────────────────────┬─────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
 [ Local DBs: Neo4j / pgvector ]   [ Secure Private Inference ]
 (Stores Crime Nodes & Vectors)     (Gemma 4 via trusted Western provider)
```

---

## 🚀 Deployment Steps

To process an unstructured police narrative (FIR) into structured graph nodes while keeping the environment sovereign and scalable, follow this setup:

### Step 1: Initialize the AppSail Microservice
Use the Catalyst CLI to initialize the backend:
```bash
catalyst init
```
*Select **AppSail**, choose **Catalyst-Managed Runtime**, and select **Python**.*

### Step 2: Configure Environment Variables
Inside your Catalyst web console, configure the `HF_SECURE_TOKEN` environment variable so that the API key is securely encrypted and completely decoupled from your source code.

### Step 3: Deploy Live
Deploy the middleware architecture live to production directly via the terminal:
```bash
catalyst deploy appsail
```

---

## 🛡️ Ensuring Data Sovereignty and Security

Because this system manages high-stakes data for the Karnataka State Police, AppSail offers several strict security layers to maintain complete isolation:

1. **API Gateway Obfuscation:** The API gateway completely hides backend execution logic. The frontend visualization platform talks only to the AppSail endpoint via HTTPS, meaning the actual pipeline handles data out of public sight.
2. **Secure Key Management:** Sensitive keys, database passwords, and API tokens are never written into plain code. They are locked inside AppSail's Environment Variables panel, which is fully encrypted by Zoho.
3. **Virtual Private Network Isolation:** If the state police request an entirely air-gapped on-premise pipeline down the road, AppSail supports **OCI Container Image deployment**. This allows the entire container stack to be pulled out of the cloud and re-deployed directly onto physical local government servers without rewriting the application logic.
