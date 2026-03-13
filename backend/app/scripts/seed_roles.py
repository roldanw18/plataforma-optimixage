from app.core.database import SessionLocal
from app.models.rol import Rol


db = SessionLocal()

roles = ["Admin", "Cliente"]

for r in roles:

    existe = db.query(Rol).filter(Rol.nombre == r).first()

    if not existe:
        nuevo = Rol(nombre=r)
        db.add(nuevo)

db.commit()

print("Roles creados")
