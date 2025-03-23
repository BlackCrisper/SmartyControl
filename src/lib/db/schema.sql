-- Tabela de Categorias
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Categories] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_at] DATETIME DEFAULT GETDATE()
    )
END

-- Tabela de Produtos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Products] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [sku] NVARCHAR(50) NULL,
        [barcode] NVARCHAR(50) NULL,
        [price] DECIMAL(18, 2) NOT NULL,
        [cost_price] DECIMAL(18, 2) NOT NULL,
        [stock_quantity] INT NOT NULL DEFAULT 0,
        [min_stock_level] INT NOT NULL DEFAULT 0,
        [category_id] INT NOT NULL,
        [image_url] NVARCHAR(500) NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_at] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([category_id]) REFERENCES [dbo].[Categories] ([id])
    )
END

-- Tabela de Transações
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Transactions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [type] NVARCHAR(10) NOT NULL CHECK ([type] IN ('input', 'output')),
        [product_id] INT NOT NULL,
        [quantity] INT NOT NULL,
        [price_per_unit] DECIMAL(18, 2) NOT NULL,
        [total_price] DECIMAL(18, 2) NOT NULL,
        [notes] NVARCHAR(MAX) NULL,
        [created_by] NVARCHAR(100) NULL,
        [transaction_date] DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [FK_Transactions_Products] FOREIGN KEY ([product_id]) REFERENCES [dbo].[Products] ([id])
    )
END

-- Tabela de Usuários
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(100) NOT NULL UNIQUE,
        [password] NVARCHAR(255) NOT NULL, -- Senha com hash
        [image_url] NVARCHAR(500) NULL,
        [role] NVARCHAR(20) DEFAULT 'user', -- 'admin', 'manager', etc.
        [token_version] INT DEFAULT 0, -- Nova coluna para versão do token
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_at] DATETIME DEFAULT GETDATE()
    );

    -- Inserir usuários iniciais com senhas com hash (Argon2)
    -- A senha para o usuário administrador é 'admin'
    INSERT INTO [dbo].[Users] ([name], [email], [password], [image_url], [role], [token_version]) VALUES
    ('Black Crisper', 'blackcrisper@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$QlhMaHl2YXlOVGo4MlNnRg$2xtX6XyPEKLNJ4hZ4BgLmKtgXTPbMJf2q7HQjJ8Yd6I', 'https://ui-avatars.com/api/?name=Black+Crisper&background=111111&color=fff', 'admin', 0);
END
ELSE
BEGIN
    -- Se a tabela já existe, mas a coluna token_version não existe, adicione-a
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'token_version')
    BEGIN
        ALTER TABLE [dbo].[Users] ADD [token_version] INT DEFAULT 0;
    END
END

-- Tabela de Redefinição de Senha
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PasswordResets]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PasswordResets] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NOT NULL,
        [token] NVARCHAR(255) NOT NULL,
        [used] BIT NOT NULL DEFAULT 0,
        [expires_at] DATETIME NOT NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [FK_PasswordResets_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([id])
    );

    CREATE INDEX [IX_PasswordResets_Token] ON [dbo].[PasswordResets] ([token]);
END

-- Tabela de Logs de Atividades
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ActivityLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ActivityLogs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NULL,
        [user_email] NVARCHAR(100) NULL,
        [action] NVARCHAR(100) NOT NULL,
        [entity_type] NVARCHAR(50) NOT NULL, -- 'product', 'category', 'user', 'transaction', 'system'
        [entity_id] INT NULL,
        [details] NVARCHAR(MAX) NULL,
        [ip_address] NVARCHAR(50) NULL,
        [user_agent] NVARCHAR(255) NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [FK_ActivityLogs_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([id])
    );

    CREATE INDEX [IX_ActivityLogs_EntityType] ON [dbo].[ActivityLogs] ([entity_type]);
    CREATE INDEX [IX_ActivityLogs_UserId] ON [dbo].[ActivityLogs] ([user_id]);
    CREATE INDEX [IX_ActivityLogs_CreatedAt] ON [dbo].[ActivityLogs] ([created_at]);
END
