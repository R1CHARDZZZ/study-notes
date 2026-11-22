Option Explicit

Const NotesUrl = "http://127.0.0.1:5173/"

Dim files, shell, projectFolder, vitepressPath, expectedClient, attempt, launchError
Set files = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
projectFolder = files.GetParentFolderName(WScript.ScriptFullName)
vitepressPath = files.BuildPath(projectFolder, "node_modules\vitepress\bin\vitepress.js")
expectedClient = Replace(files.BuildPath(projectFolder, _
    "node_modules\vitepress\dist\client\app\index.js"), "\", "/")

If NotesAreRunning() Then
    shell.Run NotesUrl, 1, False
    WScript.Quit
End If

If Not files.FileExists(vitepressPath) Then
    MsgBox "Install dependencies with npm.cmd ci in the Study Notes folder.", vbExclamation, "Study Notes"
    WScript.Quit 1
End If

shell.CurrentDirectory = projectFolder
On Error Resume Next
shell.Run "node.exe """ & vitepressPath & """ dev docs --host 127.0.0.1 --port 5173 --strictPort", 0, False
launchError = Err.Number
On Error GoTo 0

If launchError <> 0 Then
    MsgBox "Could not start Node.js. Check that Node.js is installed and on PATH.", vbExclamation, "Study Notes"
    WScript.Quit 1
End If

For attempt = 1 To 60
    If NotesAreRunning() Then
        shell.Run NotesUrl, 1, False
        WScript.Quit
    End If
    WScript.Sleep 250
Next

MsgBox "Could not open Study Notes. Run start-notes.cmd to see the startup details.", vbExclamation, "Study Notes"
WScript.Quit 1

Function NotesAreRunning()
    Dim request
    NotesAreRunning = False
    On Error Resume Next
    Set request = CreateObject("WinHttp.WinHttpRequest.5.1")
    request.SetTimeouts 400, 400, 400, 400
    request.SetProxy 1
    request.Open "GET", NotesUrl, False
    request.Send
    If Err.Number = 0 Then
        If request.Status = 200 Then
            NotesAreRunning = InStr(1, Replace(request.ResponseText, "\", "/"), expectedClient, vbTextCompare) > 0
        End If
    End If
End Function
