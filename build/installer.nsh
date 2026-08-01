!macro customInstall
  # Utilise les outils système standard de NSIS pour épingler le raccourci créé
  ${StdUtils.InvokeShellVerb} $0 "$SMPROGRAMS\${productName}\${productName}.lnk" "" ${StdUtils.Const.ShellVerb.PinToTaskbar}
!macroend