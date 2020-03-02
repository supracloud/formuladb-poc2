export interface EditorComponent {
    name: string;
}
export interface ComponentEditorI {
    matchNode(node): EditorComponent | null;
}