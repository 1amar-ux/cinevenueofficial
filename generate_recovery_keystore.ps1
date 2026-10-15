# CineVenue - Recovery Keystore Generator & Verifier
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$targetKeystore = Join-Path $scriptDir "android\cinevenue-upload-key-recovery-2026.jks"
$targetCert = Join-Path $scriptDir "android\cinevenue-upload-cert-recovery-2026.pem"
$targetAlias = "cinevenue-upload-key-recovery"

# Safety Check 1: Refuse to overwrite if files already exist
if (Test-Path $targetKeystore) {
    Write-Host "[SAFETY HALT] Keystore file already exists at: $targetKeystore" -ForegroundColor Red
    Write-Host "Refusing to overwrite existing file." -ForegroundColor Red
    exit 1
}

if (Test-Path $targetCert) {
    Write-Host "[SAFETY HALT] Certificate file already exists at: $targetCert" -ForegroundColor Red
    Write-Host "Refusing to overwrite existing file." -ForegroundColor Red
    exit 1
}

$keytool = "C:\Program Files\Java\jdk-24\bin\keytool.exe"
if (-not (Test-Path $keytool)) {
    $keytool = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
}

if (-not (Test-Path $keytool)) {
    Write-Host "[ERROR] Java keytool.exe could not be found." -ForegroundColor Red
    exit 1
}

function Prompt-Password-Console {
    $p1 = Read-Host -Prompt "Enter password for 'cinevenue-upload-key-recovery'" -AsSecureString
    if (-not $p1 -or $p1.Length -eq 0) {
        Write-Host "[ERROR] Password cannot be empty." -ForegroundColor Red
        return $null
    }
    $p2 = Read-Host -Prompt "Confirm password for 'cinevenue-upload-key-recovery'" -AsSecureString
    
    $b1 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p1)
    $s1 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($b1)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b1)

    $b2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p2)
    $s2 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($b2)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b2)

    if ($s1 -cne $s2) {
        Write-Host "[ERROR] Passwords do not match. Aborting." -ForegroundColor Red
        return $null
    }
    return $s1
}

function Prompt-Password-GUI {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "CineVenue - Create Recovery Keystore"
    $form.Size = New-Object System.Drawing.Size(460, 270)
    $form.StartPosition = "CenterScreen"
    $form.TopMost = $true
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false

    $label1 = New-Object System.Windows.Forms.Label
    $label1.Text = "Enter password for 'cinevenue-upload-key-recovery':"
    $label1.Location = New-Object System.Drawing.Point(20, 20)
    $label1.Size = New-Object System.Drawing.Size(400, 20)
    $label1.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label1)

    $box1 = New-Object System.Windows.Forms.TextBox
    $box1.Location = New-Object System.Drawing.Point(20, 45)
    $box1.Size = New-Object System.Drawing.Size(400, 25)
    $box1.UseSystemPasswordChar = $true
    $form.Controls.Add($box1)

    $label2 = New-Object System.Windows.Forms.Label
    $label2.Text = "Confirm password:"
    $label2.Location = New-Object System.Drawing.Point(20, 85)
    $label2.Size = New-Object System.Drawing.Size(400, 20)
    $label2.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($label2)

    $box2 = New-Object System.Windows.Forms.TextBox
    $box2.Location = New-Object System.Drawing.Point(20, 110)
    $box2.Size = New-Object System.Drawing.Size(400, 25)
    $box2.UseSystemPasswordChar = $true
    $form.Controls.Add($box2)

    $btnOk = New-Object System.Windows.Forms.Button
    $btnOk.Text = "Create Keystore"
    $btnOk.Location = New-Object System.Drawing.Point(190, 165)
    $btnOk.Size = New-Object System.Drawing.Size(130, 30)
    $btnOk.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Controls.Add($btnOk)

    $btnCancel = New-Object System.Windows.Forms.Button
    $btnCancel.Text = "Cancel"
    $btnCancel.Location = New-Object System.Drawing.Point(330, 165)
    $btnCancel.Size = New-Object System.Drawing.Size(90, 30)
    $btnCancel.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.Controls.Add($btnCancel)

    $form.AcceptButton = $btnOk
    $form.CancelButton = $btnCancel

    $res = $form.ShowDialog()
    if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
        if ($box1.Text -cne $box2.Text) {
            [System.Windows.Forms.MessageBox]::Show("Passwords do not match!", "Error", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
            return $null
        }
        return $box1.Text
    }
    return $null
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " CineVenue - Generate Recovery Upload Keystore" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Target Keystore:   $targetKeystore"
Write-Host "Target Cert:       $targetCert"
Write-Host "Target Alias:      $targetAlias"
Write-Host "Key Algorithm:     RSA 2048-bit"
Write-Host "Validity:          10,000 days`n"

$plainPass = $null
$isRedirected = $false
try {
    if ([Console]::IsInputRedirected) { $isRedirected = $true }
} catch {
    $isRedirected = $true
}

if (-not $isRedirected) {
    try {
        $plainPass = Prompt-Password-Console
    } catch {
        $plainPass = $null
    }
}

if (-not $plainPass) {
    Write-Host "Opening secure password dialog..." -ForegroundColor Yellow
    $plainPass = Prompt-Password-GUI
}

if (-not $plainPass -or $plainPass.Length -eq 0) {
    Write-Host "[CANCELLED] Operation cancelled or empty password provided." -ForegroundColor Yellow
    exit 1
}

# Generate keystore safely using temporary input file
Write-Host "`n[1/3] Generating recovery keystore..." -ForegroundColor Yellow
$tmpFile = [System.IO.Path]::GetTempFileName()
try {
    [System.IO.File]::WriteAllText($tmpFile, $plainPass, [System.Text.Encoding]::UTF8)
    
    $dname = "CN=CineVenue, OU=Mobile, O=CineVenue, L=Hyderabad, ST=Telangana, C=IN"
    $genOut = & $keytool -genkeypair -v -storetype PKCS12 -keystore $targetKeystore `
        -alias $targetAlias -keyalg RSA -keysize 2048 -validity 10000 `
        -dname $dname "-storepass:file" $tmpFile 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ERROR] Keystore generation failed!" -ForegroundColor Red
        Write-Host $genOut[0] -ForegroundColor Red
        exit 1
    }
    Write-Host "  --> Keystore successfully created at: $targetKeystore" -ForegroundColor Green

    # Validate immediately
    Write-Host "`n[2/3] Validating password against new keystore..." -ForegroundColor Yellow
    $valOut = & $keytool -list -v -keystore $targetKeystore -alias $targetAlias "-storepass:file" $tmpFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ERROR] Immediate validation FAILED!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  --> Password validation PASSED!" -ForegroundColor Green

    # Export public certificate
    Write-Host "`n[3/3] Exporting public certificate (.pem)..." -ForegroundColor Yellow
    $expOut = & $keytool -exportcert -rfc -keystore $targetKeystore -alias $targetAlias -file $targetCert "-storepass:file" $tmpFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n[ERROR] Certificate export failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  --> Certificate successfully exported to: $targetCert" -ForegroundColor Green

    # Verify exported certificate details
    Write-Host "`n======================================================================" -ForegroundColor Green
    Write-Host " RECOVERY KEYSTORE VERIFICATION DETAILS" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    
    $certOut = & $keytool -printcert -file $targetCert 2>&1
    $sha256 = ($certOut | Where-Object { $_ -match "SHA256:\s*(.*)" } | ForEach-Object { $matches[1].Trim() })
    $sha1 = ($certOut | Where-Object { $_ -match "SHA1:\s*(.*)" } | ForEach-Object { $matches[1].Trim() })
    $validFrom = ($certOut | Where-Object { $_ -match "Valid from:\s*(.*)" } | ForEach-Object { $matches[1].Trim() })
    $keyType = ($certOut | Where-Object { $_ -match "Subject Public Key Algorithm:\s*(.*)" } | ForEach-Object { $matches[1].Trim() })
    
    Write-Host "  Keystore File:    $targetKeystore" -ForegroundColor Cyan
    Write-Host "  Certificate File: $targetCert" -ForegroundColor Cyan
    Write-Host "  Key Alias:        $targetAlias" -ForegroundColor Cyan
    Write-Host "  Key Algorithm:    $keyType" -ForegroundColor Cyan
    Write-Host "  Validity:         $validFrom" -ForegroundColor Cyan
    Write-Host "  SHA-256:          $sha256" -ForegroundColor Cyan
    Write-Host "  SHA-1:            $sha1" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "NOTE: keystore.properties was NOT modified as per instructions." -ForegroundColor Yellow
} finally {
    $plainPass = $null
    if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force }
}
