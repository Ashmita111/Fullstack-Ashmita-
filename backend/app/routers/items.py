from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("", response_model=list[schemas.ItemOut])
def list_items(
    cat_id: Optional[str] = None,
    inv_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_items(db, current_user.id, cat_id=cat_id, inv_id=inv_id)


@router.post("", response_model=schemas.ItemOut, status_code=201)
def create_item(
    payload: schemas.ItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = crud.get_category(db, payload.category_id, current_user.id)
    if not cat:
        raise HTTPException(status_code=404, detail=f"Category {payload.category_id} not found")
    return crud.create_item(db, payload)


@router.get("/{item_id}", response_model=schemas.ItemOut)
def get_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    return item


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: str,
    payload: schemas.ItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    cat = crud.get_category(db, payload.category_id, current_user.id)
    if not cat:
        raise HTTPException(status_code=404, detail=f"Category {payload.category_id} not found")
    return crud.update_item(db, item, payload)


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")
    crud.delete_item(db, item)
