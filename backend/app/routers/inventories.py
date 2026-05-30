from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/inventories", tags=["inventories"])


@router.get("", response_model=list[schemas.InventoryOut])
def list_inventories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_inventories(db, current_user.id)


@router.post("", response_model=schemas.InventoryOut, status_code=201)
def create_inventory(
    payload: schemas.InventoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_inventory(db, payload, current_user.id)


@router.get("/{inv_id}", response_model=schemas.InventoryOut)
def get_inventory(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Inventory {inv_id} not found")
    category_count = len(inv.categories)
    item_count = sum(len(cat.items) for cat in inv.categories)
    return schemas.InventoryOut(
        id=inv.id,
        name=inv.name,
        description=inv.description,
        category_count=category_count,
        item_count=item_count,
        created_at=inv.created_at,
    )


@router.put("/{inv_id}", response_model=schemas.InventoryOut)
def update_inventory(
    inv_id: str,
    payload: schemas.InventoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Inventory {inv_id} not found")
    return crud.update_inventory(db, inv, payload)


@router.delete("/{inv_id}", status_code=204)
def delete_inventory(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Inventory {inv_id} not found")
    crud.delete_inventory(db, inv)


@router.get("/{inv_id}/categories", response_model=list[schemas.CategoryOut])
def list_categories(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cats = crud.get_categories(db, inv_id, current_user.id)
    if cats is None:
        raise HTTPException(status_code=404, detail=f"Inventory {inv_id} not found")
    return cats


@router.post("/{inv_id}/categories", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    inv_id: str,
    payload: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Inventory {inv_id} not found")
    return crud.create_category(db, inv_id, payload)


@router.put("/{inv_id}/categories/{cat_id}", response_model=schemas.CategoryOut)
def update_category(
    inv_id: str,
    cat_id: str,
    payload: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = crud.get_category(db, cat_id, current_user.id)
    if not cat or cat.inventory_id != inv_id:
        raise HTTPException(
            status_code=404,
            detail=f"Category {cat_id} not found in inventory {inv_id}",
        )
    return crud.update_category(db, cat, payload)


@router.delete("/{inv_id}/categories/{cat_id}", status_code=204)
def delete_category(
    inv_id: str,
    cat_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = crud.get_category(db, cat_id, current_user.id)
    if not cat or cat.inventory_id != inv_id:
        raise HTTPException(
            status_code=404,
            detail=f"Category {cat_id} not found in inventory {inv_id}",
        )
    crud.delete_category(db, cat)
