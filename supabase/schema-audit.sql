-- ============================================================
-- SISMAC — Schema Audit: Trazabilidad y Notificaciones
-- ============================================================

-- ============================================================
-- AUDIT LOG (INMUTABLE — solo INSERT)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VIEW', 'APPROVE', 'REJECT')),
  tabla TEXT NOT NULL,
  registro_id TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- SIN updated_at — este registro NUNCA se modifica
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'documento_por_vencer',
    'documento_vencido',
    'tarea_asignada',
    'tarea_demorada',
    'factura_por_vencer',
    'factura_vencida',
    'presupuesto_aprobado',
    'presupuesto_rechazado',
    'gasto_aprobado',
    'gasto_rechazado',
    'proceso_completado',
    'comentario_nuevo',
    'sistema'
  )),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  accion_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  leida_en TIMESTAMPTZ
);

-- ============================================================
-- FUNCIÓN: Trigger de auditoría genérico
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (usuario_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_budgets AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_client_documents AFTER INSERT OR UPDATE OR DELETE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- ============================================================
-- FUNCIÓN: Generar alertas diarias (pg_cron 07:00 ARS)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_daily_alerts()
RETURNS void AS $$
DECLARE
  doc RECORD;
  inv RECORD;
  tsk RECORD;
BEGIN
  -- DOCUMENTOS POR VENCER
  FOR doc IN
    SELECT cd.id, cd.cliente_id, cd.fecha_vencimiento, dt.nombre AS tipo_nombre,
           c.nombre AS cliente_nombre,
           (cd.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
    FROM client_documents cd
    JOIN document_types dt ON dt.id = cd.document_type_id
    JOIN clientes c ON c.id = cd.cliente_id
    WHERE cd.estado IN ('vigente', 'por_vencer', 'vencido')
      AND (cd.fecha_vencimiento - CURRENT_DATE) IN (30, 15, 7, 1, 0)
      AND (
        (dt.alerta_dias_30 = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 30) OR
        (dt.alerta_dias_15 = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 15) OR
        (dt.alerta_dias_7  = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 7)  OR
        (dt.alerta_dias_1  = true AND (cd.fecha_vencimiento - CURRENT_DATE) = 1)  OR
        ((cd.fecha_vencimiento - CURRENT_DATE) <= 0)
      )
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    SELECT u.id,
      CASE WHEN doc.dias_restantes <= 0 THEN 'documento_vencido' ELSE 'documento_por_vencer' END,
      CASE WHEN doc.dias_restantes <= 0
        THEN 'Documento vencido: ' || doc.tipo_nombre
        ELSE 'Vence en ' || doc.dias_restantes || ' días: ' || doc.tipo_nombre
      END,
      doc.cliente_nombre || ' — ' || doc.tipo_nombre ||
      CASE WHEN doc.dias_restantes <= 0
        THEN ' venció el ' || TO_CHAR(doc.fecha_vencimiento, 'DD/MM/YYYY')
        ELSE ' vence el ' || TO_CHAR(doc.fecha_vencimiento, 'DD/MM/YYYY')
      END,
      '/compliance/documentos/' || doc.id,
      jsonb_build_object(
        'documento_id', doc.id,
        'cliente_id', doc.cliente_id,
        'dias_restantes', doc.dias_restantes
      )
    FROM usuarios u
    WHERE u.rol IN ('admin_sismac') AND u.activo = true
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- FACTURAS POR VENCER / VENCIDAS
  FOR inv IN
    SELECT i.id, i.numero, i.total, i.fecha_vencimiento,
           c.nombre AS cliente_nombre,
           (i.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
    FROM invoices i
    JOIN clientes c ON c.id = i.cliente_id
    WHERE i.estado IN ('emitida', 'enviada')
      AND (i.fecha_vencimiento - CURRENT_DATE) IN (7, 3, 1, 0, -7, -15, -30)
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    SELECT u.id,
      CASE WHEN inv.dias_restantes <= 0 THEN 'factura_vencida' ELSE 'factura_por_vencer' END,
      'Factura ' || inv.numero ||
        CASE WHEN inv.dias_restantes <= 0 THEN ' — VENCIDA' ELSE ' vence en ' || inv.dias_restantes || ' días' END,
      inv.cliente_nombre || ' — $' || TO_CHAR(inv.total, 'FM999,999,999.00') ||
      ' — Vto: ' || TO_CHAR(inv.fecha_vencimiento, 'DD/MM/YYYY'),
      '/finanzas/facturas/' || inv.id,
      jsonb_build_object('invoice_id', inv.id, 'dias_restantes', inv.dias_restantes)
    FROM usuarios u
    WHERE u.rol IN ('admin_sismac', 'admin_financiero') AND u.activo = true
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- TAREAS DEMORADAS
  FOR tsk IN
    SELECT t.id, t.titulo, t.asignado_a, t.fecha_limite, c.nombre AS cliente_nombre
    FROM tasks t
    LEFT JOIN clientes c ON c.id = t.cliente_id
    WHERE t.estado = 'demorada'
      AND t.asignado_a IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE (n.metadata->>'task_id')::TEXT = t.id::TEXT
          AND n.tipo = 'tarea_demorada'
          AND n.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, accion_url, metadata)
    VALUES (
      tsk.asignado_a,
      'tarea_demorada',
      'Tarea demorada: ' || tsk.titulo,
      'Venció el ' || TO_CHAR(tsk.fecha_limite, 'DD/MM/YYYY HH24:MI') ||
        CASE WHEN tsk.cliente_nombre IS NOT NULL THEN ' — ' || tsk.cliente_nombre ELSE '' END,
      '/bpm/tareas/' || tsk.id,
      jsonb_build_object('task_id', tsk.id)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Programar jobs con pg_cron (ejecutar manualmente en Supabase)
-- ============================================================
-- SELECT cron.schedule('sismac-vencimientos', '0 7 * * *', 'SELECT check_and_update_vencimientos()');
-- SELECT cron.schedule('sismac-alertas',      '5 7 * * *', 'SELECT generate_daily_alerts()');

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Audit log: solo admin puede leer, el trigger escribe con SECURITY DEFINER
CREATE POLICY "audit_log_admin" ON audit_log FOR SELECT
  USING (get_user_rol() = 'admin_sismac');

-- Notificaciones: cada usuario ve las suyas
CREATE POLICY "notifications_own" ON notifications FOR SELECT
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  USING (usuario_id = auth.uid());
CREATE POLICY "notifications_insert_system" ON notifications FOR INSERT
  WITH CHECK (true); -- El sistema inserta para cualquier usuario

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_usuario_leida ON notifications(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
