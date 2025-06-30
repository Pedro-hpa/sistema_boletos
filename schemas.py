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

class EmpresaBase(BaseModel):
    nome: str
    cnpj: str | None = None
    qsa: str | None = None
    endereco_receita: str | None = None
    telefone_receita: str | None = None
    email_receita: str | None = None
    telefones: str | None = None
    emails: str | None = None
    socios: str | None = None
    enderecos: str | None = None
    empresas_ligadas: str | None = None
    pessoas_ligadas: str | None = None
    ex_socios: str | None = None
    observacoes: str | None = None

class EmpresaCreate(EmpresaBase): pass

class EmpresaResponse(EmpresaBase):
    id: int
    model_config = {"from_attributes": True}
