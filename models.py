from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Boleto(Base):
    __tablename__ = "boletos"

    id = Column(Integer, primary_key=True, index=True)
    empresa = Column(String)
    devedor = Column(String)
    localidade = Column(String)
    valor_parcela = Column(Float)
    valor_total = Column(Float)
    qtd_parcelas = Column(Integer)
    parcela_atual = Column(Integer)
    data_geracao = Column(Date)
    data_vencimento = Column(Date)
    status = Column(String, default="pendente")

    observacoes = relationship("Observacao", back_populates="boleto", cascade="all, delete-orphan")

class Observacao(Base):
    __tablename__ = "observacoes"

    id = Column(Integer, primary_key=True, index=True)
    boleto_id = Column(Integer, ForeignKey("boletos.id"))
    data = Column(Date)
    descricao = Column(String)

    boleto = relationship("Boleto", back_populates="observacoes")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    cnpj = Column(String)
    qsa = Column(String)
    endereco_receita = Column(String)
    telefone_receita = Column(String)
    email_receita = Column(String)
    telefones = Column(String)
    emails = Column(String)
    socios = Column(String)
    enderecos = Column(String)
    empresas_ligadas = Column(String)
    pessoas_ligadas = Column(String)
    ex_socios = Column(String)
    observacoes = Column(String)