# Switches the OS keyboard layout for the FOREGROUND window (Windows).
# Usage: powershell -ExecutionPolicy Bypass -File switch-layout.ps1 <KLID>
param(
    [string]$KLID = "00000409"
)

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class KbSwitch {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern IntPtr LoadKeyboardLayout(string pwszKLID, uint Flags);
    [DllImport("user32.dll")]
    public static extern IntPtr PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
}
"@

$hwnd = [KbSwitch]::GetForegroundWindow()
$hkl = [KbSwitch]::LoadKeyboardLayout($KLID, 1)  # KLF_ACTIVATE
$WM_INPUTLANGCHANGEREQUEST = 0x0050
$res = [KbSwitch]::PostMessage($hwnd, $WM_INPUTLANGCHANGEREQUEST, [IntPtr]::Zero, $hkl)

Write-Output "STATUS=sent KLID=$KLID RESULT=$res"
