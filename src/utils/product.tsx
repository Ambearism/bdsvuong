export const getRequiredRule = (condition: boolean, message: string) => {
    return condition
        ? [
              { required: true, message },
              { type: 'number' as const, min: 0 },
          ]
        : [{ type: 'number' as const, min: 0 }]
}
