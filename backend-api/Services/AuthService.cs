using GlobalFeedbackManagement.Data;
using GlobalFeedbackManagement.Models;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GlobalFeedbackManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<AuthResult> LoginAsync(string email, string password)
        {
            // Automatic Role Determination from Email Pattern
            string detectedRole = null;
            if (email.ToLower().Contains(".gtm@"))
            {
                detectedRole = "GTM Manager";
            }
            else if (email.ToLower().Contains(".cu@"))
            {
                detectedRole = "CU Manager";
            }

            if (detectedRole == null)
            {
                return new AuthResult { Success = false, Message = "Invalid email pattern. Role cannot be determined." };
            }

            // Find User in Database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            if (user == null)
            {
                return new AuthResult { Success = false, Message = "User not found or invalid credentials." };
            }

            // Role Validation against Email Pattern
            if (user.Role != detectedRole)
            {
                return new AuthResult { Success = false, Message = "Invalid role for this email pattern." };
            }

            // Simplified: Accepts any password for demonstration if it evaluates the email.
            // If checking hash: if (!BCrypt.Verify(password, user.PasswordHash)) return false...

            // Generate JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("UserId", user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            return new AuthResult 
            { 
                Success = true, 
                Message = $"Welcome back, {user.Name}",
                Data = user,
                Token = jwtToken 
            };
        }
    }
}
