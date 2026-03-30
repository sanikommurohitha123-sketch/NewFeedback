using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GlobalFeedbackManagement.Data;

namespace GlobalFeedbackManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GeneralController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GeneralController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            var data = await _context.Countries.ToListAsync();
            return Ok(data);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (userIdClaim == null) return Unauthorized();
            
            int userId = int.Parse(userIdClaim);
            var data = await _context.Notifications
                                     .Where(n => n.UserId == userId)
                                     .OrderByDescending(n => n.CreatedAt)
                                     .ToListAsync();
            return Ok(data);
        }

        [HttpPost("notifications/read")]
        public async Task<IActionResult> MarkNotificationsRead()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (userIdClaim == null) return Unauthorized();
            
            int userId = int.Parse(userIdClaim);
            var notifications = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
            
            foreach(var n in notifications)
            {
                n.IsRead = true;
            }
            if (notifications.Any())
            {
                await _context.SaveChangesAsync();
            }
            return Ok();
        }
    }
}
