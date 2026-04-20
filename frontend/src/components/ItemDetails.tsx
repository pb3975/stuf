import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Item } from '../types/Item';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Download, ArrowLeft, Trash2, Plus, Copy } from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../lib/config';
import { categoryDot, categorySwatch, categoryInk } from '@/lib/categoryColor';
import CategoryThumb from './CategoryThumb';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(getApiUrl(`/items/${id}`));
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await axios.delete(getApiUrl(`/items/${item.id}`));
      navigate('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="flex gap-4">
            <div className="h-20 w-20 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-4 w-1/3 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl text-center">
        <p className="text-muted-foreground mb-4">Item not found.</p>
        <Button asChild>
          <Link to="/">Back to inventory</Link>
        </Button>
      </div>
    );
  }

  const swatch = categorySwatch(item.category);
  const ink = categoryInk(item.category);
  const attrHeader =
    'px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b';

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Link>
        </Button>
        <span className="font-mono text-[11px]" style={{ color: 'var(--fg-dim)' }}>
          STF-{String(item.id).padStart(4, '0')}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        {/* Main column */}
        <div>
          {/* Header row with thumb + name + actions */}
          <div className="flex items-start gap-4 mb-6">
            <CategoryThumb
              category={item.category}
              size={72}
              radius={12}
              imageUrl={item.image_url ? getAssetUrl(item.image_url) : undefined}
              alt={item.name}
            />
            <div className="flex-1 min-w-0">
              <div className="mb-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium"
                  style={{
                    padding: '3px 8px',
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 2,
                      background: categoryDot(item.category),
                    }}
                  />
                  {item.category}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight break-words">{item.name}</h1>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild className="h-8">
                <Link to={`/item/${id}/edit`}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero image/swatch */}
          <div
            className="rounded-xl overflow-hidden mb-5 relative"
            style={{
              aspectRatio: '16/9',
              background: item.image_url ? 'transparent' : swatch,
              border: '1px solid hsl(var(--border))',
            }}
          >
            {item.image_url ? (
              <img
                src={getAssetUrl(item.image_url)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(135deg, transparent 0 12px, rgba(0,0,0,.03) 12px 13px)',
                  }}
                />
                <span
                  className="font-mono absolute bottom-3 left-4 uppercase"
                  style={{
                    fontSize: 10,
                    color: ink,
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                  }}
                >
                  {item.category}
                </span>
              </>
            )}
          </div>

          {/* Attributes card */}
          <div
            className="rounded-lg overflow-hidden mb-5"
            style={{
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
            }}
          >
            <div
              className={attrHeader}
              style={{
                color: 'var(--fg-dim)',
                background: 'hsl(var(--muted))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              Attributes
            </div>
            {[
              ['Quantity', <span className="font-mono font-medium">{item.quantity}</span>],
              ['Category', item.category],
            ].map(([k, v], i) => (
              <div
                key={k as string}
                className="grid px-3.5 py-3 text-[13px]"
                style={{
                  gridTemplateColumns: '140px 1fr',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                }}
              >
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            {item.custom_attributes &&
              Object.entries(item.custom_attributes).map(([key, value]) => (
                <div
                  key={key}
                  className="grid px-3.5 py-3 text-[13px]"
                  style={{
                    gridTemplateColumns: '140px 1fr',
                    borderTop: '1px solid var(--line-soft)',
                  }}
                >
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>{key}</span>
                  <span className="break-words">{String(value)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Right rail: QR + quick actions */}
        <div className="space-y-4">
          {item.qr_code_url && (
            <div
              className="rounded-lg p-4"
              style={{
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
              }}
            >
              <div
                className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                QR code
              </div>
              <img
                src={getAssetUrl(item.qr_code_url)}
                alt="QR code"
                className="w-full aspect-square rounded-md"
                style={{ background: '#fff', padding: 8 }}
              />
              <div
                className="font-mono text-[11px] text-center mt-2.5"
                style={{ color: 'var(--fg-dim)' }}
              >
                STF-{String(item.id).padStart(4, '0')}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 h-8" asChild>
                <a href={getAssetUrl(item.qr_code_url)} download>
                  <Download className="h-3 w-3 mr-1.5" />
                  Print label
                </a>
              </Button>
            </div>
          )}

          <div
            className="rounded-lg"
            style={{
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
            }}
          >
            <div
              className={attrHeader}
              style={{
                color: 'var(--fg-dim)',
                background: 'hsl(var(--muted))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              Quick actions
            </div>
            <Link
              to={`/item/${id}/edit`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px]"
              style={{ color: 'hsl(var(--foreground))', textDecoration: 'none' }}
            >
              <Plus className="h-3.5 w-3.5" /> Increment quantity
            </Link>
            <Link
              to={`/item/${id}/edit`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px]"
              style={{
                color: 'hsl(var(--foreground))',
                borderTop: '1px solid var(--line-soft)',
                textDecoration: 'none',
              }}
            >
              <Edit className="h-3.5 w-3.5" /> Edit item
            </Link>
            <button
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] w-full text-left"
              style={{
                color: 'hsl(var(--foreground))',
                borderTop: '1px solid var(--line-soft)',
                background: 'transparent',
                cursor: 'not-allowed',
                opacity: 0.6,
              }}
              disabled
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] w-full text-left"
                  style={{
                    color: 'hsl(var(--destructive))',
                    borderTop: '1px solid var(--line-soft)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
