interface Window {
  SpeechRecognition: any
  webkitSpeechRecognition: any
  SpeechGrammarList: any
  webkitSpeechGrammarList: any
  SpeechRecognitionEvent: any
  webkitSpeechRecognitionEvent: any
}

interface PermissionDescriptor {
  name: string
}

interface PermissionStatus extends EventTarget {
  state: "granted" | "denied" | "prompt"
  onchange: ((this: PermissionStatus, ev: Event) => any) | null
}

interface Permissions {
  query(permissionDesc: PermissionDescriptor): Promise<PermissionStatus>
}

interface Navigator {
  permissions: Permissions
}
