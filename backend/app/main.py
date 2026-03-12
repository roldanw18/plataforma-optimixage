from fastapi import FastAPI

app = FastAPI(
    title="Plataforma de Seguimiento",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}