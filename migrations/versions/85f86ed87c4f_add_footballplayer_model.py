"""Add FootballPlayer model

Revision ID: 85f86ed87c4f
Revises: 
Create Date: 2025-03-22 17:19:31.520180

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '85f86ed87c4f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('sqlite_sequence')
    op.add_column('football_players', sa.Column('player_number', sa.Integer(), nullable=False))
    op.add_column('football_players', sa.Column('image', sa.String(), nullable=True))
    op.alter_column('football_players', 'id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=True)
    op.alter_column('football_players', 'name',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=False)
    op.alter_column('football_players', 'date_of_birth',
               existing_type=sa.DATE(),
               nullable=False)
    op.alter_column('football_players', 'team',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               nullable=False)
    op.alter_column('football_players', 'country',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               nullable=False)
    op.alter_column('football_players', 'city',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               nullable=False)
    op.alter_column('football_players', 'position',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               nullable=False)
    op.alter_column('football_players', 'last_updated',
               existing_type=sa.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_nullable=True)
    op.drop_column('football_players', 'player_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('football_players', sa.Column('player_id', sa.TEXT(), nullable=True))
    op.alter_column('football_players', 'last_updated',
               existing_type=sa.DateTime(),
               type_=sa.TIMESTAMP(),
               existing_nullable=True)
    op.alter_column('football_players', 'position',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               nullable=True)
    op.alter_column('football_players', 'city',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               nullable=True)
    op.alter_column('football_players', 'country',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               nullable=True)
    op.alter_column('football_players', 'team',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               nullable=True)
    op.alter_column('football_players', 'date_of_birth',
               existing_type=sa.DATE(),
               nullable=True)
    op.alter_column('football_players', 'name',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=False)
    op.alter_column('football_players', 'id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=True)
    op.drop_column('football_players', 'image')
    op.drop_column('football_players', 'player_number')
    op.create_table('sqlite_sequence',
    sa.Column('name', sa.NullType(), nullable=True),
    sa.Column('seq', sa.NullType(), nullable=True)
    )
    # ### end Alembic commands ###
