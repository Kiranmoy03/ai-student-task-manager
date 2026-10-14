# API key and repository security

This project has a Vite/React frontend and a Python/FastAPI backend.

## Environment variables
- **Private Gemini API key:** Place `GEMINI_API_KEY` only in your local `backend/.env` or the backend hosting provider's secret environment variables. Never place it in a React component, a `VITE_*` variable, or frontend hosting settings.
- **Supabase publishable/anon key:** The frontend uses a public project URL and publishable/anon key; these values are designed to be present in browser code. Supabase Row Level Security (RLS) protects user records. Never put Supabase `service_role` or `sb_secret_*` keys in frontend code.
- **Sample configuration:** Copy `backend/.env.example` to `backend/.env`, then fill in the actual values locally. Example files may be committed only if they contain placeholders and no secrets. The separate root `.env.example` documents public frontend variables.
- **Hosted environments:** Configure real secrets in the backend hosting provider's private settings. Restart/redeploy the backend after changing them.

## Before publishing or pushing changes
1. Keep real `.env` files untracked; `.gitignore` blocks new files but cannot untrack files already in Git.
2. Check staged files with `git diff --cached` and `git status` before committing.
3. Do not include keys, access tokens, personal data, build secrets, screenshots of secrets, or Python cache files in commits.
4. If a secret was ever published, **revoke/rotate it** at the provider. Removing the file from the latest commit does not erase Git history or cached copies.

Authentication uses Supabase user access tokens and database RLS; credentials and privileged Supabase keys must never be exposed in the browser.
