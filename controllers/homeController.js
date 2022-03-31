exports.getHome = (_, res) => {
  const content = `
  <div>
    <h1>Hello! Welcome to the Notes API</h1>
    <a href='/api/v1/notes'>Go to the notes</a>
  </div>
  `
  res.send(content)
}
