# PowerShell script to test API with JWT token
# Usage: .\test_api_powershell.ps1 -Token "your-token" -QuizId "quiz-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$true)]
    [string]$QuizId,
    
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "Testing API with token..." -ForegroundColor Green
Write-Host "Quiz ID: $QuizId" -ForegroundColor Cyan
Write-Host ""

try {
    $uri = "$BaseUrl/api/quiz/$QuizId/results"
    
    Write-Host "Making request to: $uri" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
    
    # Check if diagnostic has required fields
    if ($response.diagnostic) {
        Write-Host ""
        Write-Host "Diagnostic Fields Check:" -ForegroundColor Cyan
        Write-Host "  - overall_performance: $(if ($response.diagnostic.overall_performance) { '✅ Present' } else { '❌ Missing' })"
        Write-Host "  - topic_breakdown: $(if ($response.diagnostic.topic_breakdown) { '✅ Present' } else { '❌ Missing' })"
        Write-Host "  - root_cause_analysis: $(if ($response.diagnostic.root_cause_analysis) { '✅ Present' } else { '❌ Missing' })"
        Write-Host "  - predicted_jamb_score: $(if ($response.diagnostic.predicted_jamb_score) { '✅ Present' } else { '❌ Missing' })"
        Write-Host "  - study_plan: $(if ($response.diagnostic.study_plan) { '✅ Present' } else { '❌ Missing' })"
        Write-Host "  - recommendations: $(if ($response.diagnostic.recommendations) { '✅ Present' } else { '❌ Missing' })"
    } else {
        Write-Host "❌ No diagnostic data found in response" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

