using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using GlobalFeedbackManagement.Data;
using GlobalFeedbackManagement.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5000");
// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Add Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add Services & Repositories
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IConsultantService, ConsultantService>();
builder.Services.AddAutoMapper(typeof(Program));

// Configure Authentication (JWT)
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireGTMManager", policy => policy.RequireRole("GTM Manager"));
    options.AddPolicy("RequireCUManager", policy => policy.RequireRole("CU Manager"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();


app.UseSerilogRequestLogging();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
