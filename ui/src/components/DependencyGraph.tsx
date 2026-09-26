import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getDocumentGraph } from '../services/api';
import { GitGraph, RefreshCw, AlertCircle } from 'lucide-react';

interface DependencyGraphProps {
  documentId: string;
  onOpenStandardDetail: (isNumber: string) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  documentId,
  onOpenStandardDetail,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocumentGraph(documentId, 2);

      // Transform nodes into styled ReactFlow nodes
      const formattedNodes: Node[] = (data.nodes || []).map((n) => {
        const isWithdrawn = n.data?.status === 'WITHDRAWN';
        const isSuper = n.data?.status === 'SUPERSEDED';

        let borderColor = '#3b82f6'; // default blue
        let bgColor = '#0f172a';
        let textColor = '#f8fafc';

        if (isWithdrawn) {
          borderColor = '#ef4444';
          bgColor = '#450a0a';
          textColor = '#fca5a5';
        } else if (isSuper) {
          borderColor = '#f59e0b';
          bgColor = '#451a03';
          textColor = '#fcd34d';
        } else if (n.data?.status === 'ACTIVE') {
          borderColor = '#10b981';
          bgColor = '#022c22';
          textColor = '#6ee7b7';
        }

        return {
          id: n.id,
          position: n.position || { x: Math.random() * 400, y: Math.random() * 300 },
          data: {
            label: (
              <div
                className="cursor-pointer font-mono text-center p-1"
                onClick={() => onOpenStandardDetail(n.id)}
              >
                <div className="font-bold text-xs">{n.id}</div>
                <div className="text-[10px] opacity-80">{n.data?.status || 'STANDARD'}</div>
              </div>
            ),
          },
          style: {
            background: bgColor,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '6px',
            color: textColor,
            padding: '4px 8px',
            minWidth: '130px',
          },
        };
      });

      // Transform edges
      const formattedEdges: Edge[] = (data.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: e.label === 'SUPERSEDED_BY' || e.animated,
        style: {
          stroke: e.label === 'SUPERSEDED_BY' ? '#ef4444' : '#64748b',
          strokeWidth: 1.5,
        },
        labelStyle: {
          fill: '#94a3b8',
          fontSize: 10,
          fontFamily: 'monospace',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.label === 'SUPERSEDED_BY' ? '#ef4444' : '#64748b',
        },
      }));

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    } catch (err: any) {
      setError(err.message || 'Failed to render normative graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadGraph();
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="bg-gov-900 border border-slate-800 rounded-lg p-12 text-center">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Loading Normative Dependency Graph...</p>
      </div>
    );
  }

  if (error || nodes.length === 0) {
    return (
      <div className="bg-gov-900 border border-slate-800 rounded-lg p-10 text-center">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-slate-200">Graph Subgraph Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1">{error || 'No normative reference edges found for this document.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gov-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitGraph className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-mono font-medium text-slate-200">
            NORMATIVE REFERENCE & SUPERSEDING DAG
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>ACTIVE ROOT</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span>WITHDRAWN</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>SUPERSEDED</span>
          </span>
        </div>
      </div>
      <div style={{ height: '480px', width: '100%' }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-slate-900 border border-slate-800 text-white fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
};
