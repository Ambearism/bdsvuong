const ReactCompilerConfig = {}
export default function () {
    return {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
    }
}
