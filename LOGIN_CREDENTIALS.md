# Login Credentials

## 🌍 PUBLIC ACCESS MODE

This application now operates in **PUBLIC ACCESS MODE**, meaning **ANY username and password** is accepted!

### Requirements
- **Username:** Minimum 3 characters
- **Password:** Minimum 3 characters

### Examples of Valid Logins
- Username: `rajesh` / Password: `rajesh123`
- Username: `john` / Password: `password`
- Username: `sarah` / Password: `abc123`
- Username: `yashu` / Password: `yashu`
- Username: `test` / Password: `test123`

**Any combination works as long as both are at least 3 characters long!**

This is designed for public health assessment access where everyone should be able to use the system.

## Setting Custom Credentials

You can override the default admin credentials by setting environment variables:

### Windows (PowerShell)
```powershell
$env:APP_USER="your_username"
$env:APP_PASS="your_password"
python app.py
```

### Windows (Command Prompt)
```cmd
set APP_USER=your_username
set APP_PASS=your_password
python app.py
```

### Linux/Mac
```bash
export APP_USER="your_username"
export APP_PASS="your_password"
python app.py
```

## Security Notes

⚠️ **IMPORTANT:** This is a simple authentication system for demonstration purposes only.

For production use, you should:
- Implement proper password hashing (bcrypt, argon2)
- Store user credentials in a database
- Use proper session management
- Add rate limiting for login attempts
- Implement HTTPS/SSL
- Add CSRF protection
- Consider using OAuth or similar authentication framework

## Troubleshooting

### "Invalid credentials" error
- Double-check username and password spelling
- Ensure no extra spaces before or after the username/password
- Try using `yashu` / `yashu` as a test
- Check browser console (F12) for any JavaScript errors

### Can't stay logged in
- Clear your browser cookies
- Check that the Flask app is running
- Ensure secret key is set in app.py

### Session expires too quickly
- Current session lifetime is set to 1 hour (3600 seconds)
- Modify `PERMANENT_SESSION_LIFETIME` in app.py to change this
