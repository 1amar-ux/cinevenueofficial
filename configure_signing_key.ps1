# CineVenue - Secure Release Signing Configuration Helper
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$keystorePath = Join-Path $scriptDir "android\cinevenue-upload-key-new.jks"
$propertiesPath = Join-Path $scriptDir "android\keystore.properties"

if (-not (Test-Path $keystorePath)) {
    Write-Host "[ERROR] Keystore file not found at: $keystorePath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $propertiesPath)) {
    Write-Host "[ERROR] Properties file not found at: $propertiesPath" -ForegroundColor Red
    exit 1
}

$keytool = "C:\Program Files\Java\jdk-24\bin\keytool.exe"
if (-not (Test-Path $keytool)) {
    $keytool = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
}

if (-not (Test-Path $keytool)) {
    Write-Host "[ERROR] Java keytool.exe could not be located." -ForegroundColor Red
    exit 1
}

function Prompt-Password-GUI {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "CineVenue - Upload Keystore Password"
    $form.Size = New-Object System.Drawing.Size(460, 210)
    $form.StartPosition = "CenterScreen"
    $form.TopMost = $true
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false

    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Enter password for 'cinevenue-upload-key-new':"
    $label.Location = New-Object System.Drawing.Point(20, 20)
    $label.Size = New-Object System.Drawing.Size(400, 25)
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label)

    $subLabel = New-Object System.Windows.Forms.Label
    $subLabel.Text = "This password will be validated against android\cinevenue-upload-key-new.jks"
    $subLabel.Location = New-Object System.Drawing.Point(20, 45)
    $subLabel.Size = New-Object System.Drawing.Size(410, 20)
    $subLabel.ForeColor = [System.Drawing.Color]::Gray
    $form.Controls.Add($subLabel)

    $textBox = New-Object System.Windows.Forms.TextBox
    $textBox.Location = New-Object System.Drawing.Point(20, 75)
    $textBox.Size = New-Object System.Drawing.Size(400, 25)
    $textBox.UseSystemPasswordChar = $true
    $form.Controls.Add($textBox)

    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text = "OK - Save & Verify"
    $okButton.Location = New-Object System.Drawing.Point(190, 115)
    $okButton.Size = New-Object System.Drawing.Size(130, 30)
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Controls.Add($okButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Location = New-Object System.Drawing.Point(330, 115)
    $cancelButton.Size = New-Object System.Drawing.Size(90, 30)
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.Controls.Add($cancelButton)

    $form.AcceptButton = $okButton
    $form.CancelButton = $cancelButton

    $result = $form.ShowDialog()
    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        return $textBox.Text
    }
    return $null
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " CineVenue - Configure Release Signing Properties" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Target Keystore:   android\cinevenue-upload-key-new.jks"
Write-Host "Target Properties: android\keystore.properties"
Write-Host "Target Alias:      cinevenue-upload-key-new`n"

$plain = $null
$isRedirected = $false
try {
    if ([Console]::IsInputRedirected) { $isRedirected = $true }
} catch {
    $isRedirected = $true
}

if (-not $isRedirected) {
    try {
        $secPass = Read-Host -Prompt "Enter password for cinevenue-upload-key-new" -AsSecureString
        if ($secPass -and $secPass.Length -gt 0) {
            $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPass)
            $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    } catch {
        $plain = $null
    }
}

if (-not $plain) {
    Write-Host "Opening secure password prompt dialog..." -ForegroundColor Yellow
    $plain = Prompt-Password-GUI
}

if (-not $plain -or $plain.Length -eq 0) {
    Write-Host "[CANCELLED] Operation cancelled by user or empty password provided." -ForegroundColor Yellow
    exit 1
}

# Validate password against the actual keystore file
Write-Host "`nValidating password against android\cinevenue-upload-key-new.jks..." -ForegroundColor Yellow
$tmpFile = [System.IO.Path]::GetTempFileName()
try {
    [System.IO.File]::WriteAllText($tmpFile, $plain, [System.Text.Encoding]::UTF8)
    $output = & $keytool -list -keystore $keystorePath -alias "cinevenue-upload-key-new" "-storepass:file" $tmpFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ERROR] Keystore password validation FAILED!" -ForegroundColor Red
        Write-Host "The password you entered does NOT unlock android\cinevenue-upload-key-new.jks." -ForegroundColor Red
        Write-Host "No changes were made to android\keystore.properties." -ForegroundColor Yellow
        exit 1
    }
} finally {
    if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
}

Write-Host "[VALIDATION PASSED] Password verified successfully against keystore!" -ForegroundColor Green

# Update keystore.properties preserving comments
$lines = Get-Content $propertiesPath
$newLines = @()
$hasStoreFile = $false
$hasStorePass = $false
$hasKeyAlias = $false
$hasKeyPass = $false

foreach ($line in $lines) {
    if ($line -match "^\s*storeFile\s*=") {
        $newLines += "storeFile=cinevenue-upload-key-new.jks"
        $hasStoreFile = $true
    } elseif ($line -match "^\s*storePassword\s*=") {
        $newLines += "storePassword=$plain"
        $hasStorePass = $true
    } elseif ($line -match "^\s*keyAlias\s*=") {
        $newLines += "keyAlias=cinevenue-upload-key-new"
        $hasKeyAlias = $true
    } elseif ($line -match "^\s*keyPassword\s*=") {
        $newLines += "keyPassword=$plain"
        $hasKeyPass = $true
    } else {
        $newLines += $line
    }
}

if (-not $hasStoreFile) { $newLines += "storeFile=cinevenue-upload-key-new.jks" }
if (-not $hasStorePass) { $newLines += "storePassword=$plain" }
if (-not $hasKeyAlias) { $newLines += "keyAlias=cinevenue-upload-key-new" }
if (-not $hasKeyPass) { $newLines += "keyPassword=$plain" }

[System.IO.File]::WriteAllLines($propertiesPath, $newLines)

# Verify updated file on disk immediately
$readBack = @{}
Get-Content $propertiesPath | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)=(.*)$") {
        $readBack[$matches[1].Trim()] = $matches[2].Trim()
    }
}

if ($readBack['storeFile'] -eq 'cinevenue-upload-key-new.jks' -and 
    $readBack['keyAlias'] -eq 'cinevenue-upload-key-new' -and
    $readBack['storePassword'] -and $readBack['keyPassword']) {
    Write-Host "`n======================================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] android\keystore.properties updated and verified on disk!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  storeFile     = $($readBack['storeFile'])" -ForegroundColor Cyan
    Write-Host "  keyAlias      = $($readBack['keyAlias'])" -ForegroundColor Cyan
    Write-Host "  storePassword = [Configured & Verified - Length: $($readBack['storePassword'].Length)]" -ForegroundColor Cyan
    Write-Host "  keyPassword   = [Configured & Verified - Length: $($readBack['keyPassword'].Length)]`n" -ForegroundColor Cyan
} else {
    Write-Host "`n[ERROR] Post-write verification failed. File does not contain expected properties." -ForegroundColor Red
    exit 1
}
