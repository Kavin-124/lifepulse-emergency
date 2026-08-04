# LeetCode GitHub Sync

Automated repository that syncs your solved LeetCode problems directly into GitHub using GitHub Actions.

## 🚀 How It Works

This repository utilizes the [`joshcai/leetcode-sync`](https://github.com/joshcai/leetcode-sync) GitHub Action. Every day (or whenever manually triggered), it logs into LeetCode using your session credentials, fetches all newly accepted solutions, and commits them to the `leetcode/` directory in this repository.

---

## ⚙️ Setup Instructions

### Step 1: Retrieve LeetCode Credentials

1. Open [LeetCode](https://leetcode.com/) in your browser and log in to your account.
2. Open Developer Tools:
   - **Chrome / Edge**: Press `F12` or right-click anywhere and select **Inspect**.
   - **Firefox**: Press `F12` or `Ctrl + Shift + I`.
3. Navigate to the **Application** (or **Storage**) tab:
   - Expand **Cookies** on the left sidebar and select `https://leetcode.com`.
4. Copy the values of the following two cookies:
   - `LEETCODE_SESSION`: (A long alphanumeric string starting with `eyJ...`)
   - `csrftoken`: (A 64-character token)

---

### Step 2: Configure GitHub Repository Secrets

1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** and add the following two secrets:

| Secret Name | Value |
| :--- | :--- |
| `LEETCODE_SESSION` | Paste your `LEETCODE_SESSION` cookie value |
| `LEETCODE_CSRF_TOKEN` | Paste your `csrftoken` cookie value |

---

### Step 3: Enable Workflow Permissions

To allow the GitHub Action to commit files back to your repository:

1. Go to **Settings** > **Actions** > **General**.
2. Scroll down to **Workflow permissions**.
3. Select **Read and write permissions**.
4. Click **Save**.

---

### Step 4: Run the First Sync Manually

1. Go to the **Actions** tab in your GitHub repository.
2. Under **Workflows**, click on **Sync LeetCode**.
3. Click **Run workflow** -> **Run workflow**.

Your solutions will now be fetched and pushed to the `leetcode/` folder!

---

## 📌 Notes & Troubleshooting

- **Session Expiration**: LeetCode cookie sessions occasionally expire (or if you log out explicitly). If the GitHub Action starts failing, simply re-copy your `LEETCODE_SESSION` and `csrftoken` cookies and update the repository secrets.
- **Chrome Extension Alternative**: If you prefer real-time syncing right as you press "Submit" on LeetCode, consider installing the [LeetSync](https://chrome.google.com/webstore) or [LeetHub-3.0](https://github.com/arunparihar/LeetHub-3.0) Chrome extensions.
