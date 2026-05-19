# Switches the OS keyboard layout for the FOREGROUND window (Windows).
# Usage: powershell -ExecutionPolicy Bypass -File switch-layout.ps1 <KLID>
#
# Only switches among keyboard layouts the user ALREADY has installed.
# It never calls LoadKeyboardLayout, because that API silently installs
# the layout into Windows when it is not already present (adding stray
# languages to the user's language bar). Instead it enumerates the
# installed layouts and matches on LANGID (the low 16 bits of the KLID /
# HKL), consistent with the project's "match LANGID, not full KLID"
# convention. If the target language is not installed, it does nothing.
param(
    [string]$KLID = "00000409"
)

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class KbSwitch {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetKeyboardLayoutList(int nBuff, [Out] IntPtr[] lpList);
    [DllImport("user32.dll")]
    public static extern IntPtr PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
"@

# LANGID = low 16 bits of the KLID (last 4 hex digits), e.g.
# "0000040d" -> 0x040d. The HKL's low word is likewise the LANGID.
$langid = [Convert]::ToInt32($KLID.Substring($KLID.Length - 4), 16)

$count = [KbSwitch]::GetKeyboardLayoutList(0, $null)
$list = New-Object IntPtr[] $count
[void][KbSwitch]::GetKeyboardLayoutList($count, $list)

$hkl = [IntPtr]::Zero
foreach ($h in $list) {
    if (($h.ToInt64() -band 0xFFFF) -eq $langid) { $hkl = $h; break }
}

if ($hkl -eq [IntPtr]::Zero) {
    # Target language not installed: do nothing rather than install it.
    Write-Output "STATUS=skipped KLID=$KLID REASON=not-installed"
    return
}

$hwnd = [KbSwitch]::GetForegroundWindow()
$WM_INPUTLANGCHANGEREQUEST = 0x0050
$res = [KbSwitch]::PostMessage($hwnd, $WM_INPUTLANGCHANGEREQUEST, [IntPtr]::Zero, $hkl)

Write-Output "STATUS=sent KLID=$KLID RESULT=$res"
