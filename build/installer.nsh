!macro customInstall
  # Utilisation de la constante globale NSIS fournie par electron-builder
  ${StdUtils.InvokeShellVerb} $0 "$SMPROGRAMS\${PRODUCT_NAME}.lnk" "" ${StdUtils.Const.ShellVerb.PinToTaskbar}
!macroend