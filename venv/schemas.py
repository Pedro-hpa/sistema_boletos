from pydantic import BaseModel
from datetime import date
from typing import List

class ObservacaoBase(BaseModel):
    data: date
    descricao: str

class ObservacaoCreate(ObservacaoBase):
    pass

class ObservacaoResponse(ObservacaoBase):
    id: int

    model_config = {
        "from_attributes": True
    }

class BoletoBase(BaseModel):
    empresa: str
    devedor: str
    localidade: str
    valor_parcela: float
    valor_total: float
    qtd_parcelas: int
    parcela_atual: int
    data_geracao: date
    data_vencimento: date
    status: str = "pendente"

class BoletoCreate(BoletoBase):
    pass

class BoletoResponse(BoletoBase):
    id: int
    observacoes: List[ObservacaoResponse] = []

    model_config = {
        "from_attributes": True
    }
