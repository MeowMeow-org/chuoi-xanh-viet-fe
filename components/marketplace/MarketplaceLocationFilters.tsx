'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  fetchDistrictWithWards,
  fetchProvinceWithDistricts,
  fetchProvinces,
} from '@/lib/vietnamAddressApi';
import type { ProvinceListItem } from '@/lib/vietnamAddressApi';

const sortVi = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, 'vi');

function normalizeLocationName(name: string): string {
  return name
    .replace(/^Thành phố\s+/u, '')
    .replace(/^Tỉnh\s+/u, '')
    .replace(/^Quận\s+/u, '')
    .replace(/^Huyện\s+/u, '')
    .replace(/^Thị xã\s+/u, '')
    .replace(/^Thị trấn\s+/u, '')
    .replace(/^Phường\s+/u, '')
    .replace(/^Xã\s+/u, '')
    .trim();
}

// ── Scrollable radio list ──────────────────────────────────────────────────
type RadioItem = { code: number; name: string };

function RadioScrollList({
  items,
  selected,
  onSelect,
  loading,
  allLabel,
  radioName,
  columns = 1,
  maxHeight = '160px',
}: {
  items: RadioItem[];
  selected: number | null;
  onSelect: (code: number | null) => void;
  loading?: boolean;
  allLabel: string;
  radioName: string;
  columns?: 1 | 2;
  maxHeight?: string;
}) {
  if (loading) {
    return (
      <div className='flex h-10 items-center gap-2 text-xs text-muted-foreground'>
        <Loader2 className='h-3.5 w-3.5 animate-spin' />
        Đang tải…
      </div>
    );
  }

  return (
    <div
      className='overflow-y-auto rounded-md border border-border bg-background'
      style={{ maxHeight }}
    >
      <div className={cn('p-1', columns === 2 && 'grid grid-cols-2')}>
        <label
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
            selected === null
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-accent/60 text-muted-foreground',
          )}
        >
          <input
            type='radio'
            name={radioName}
            checked={selected === null}
            onChange={() => onSelect(null)}
            className='h-3.5 w-3.5 accent-primary'
          />
          {allLabel}
        </label>

        {items.map((item) => {
          const active = selected === item.code;
          return (
            <label
              key={item.code}
              className={cn(
                'flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent/60',
              )}
            >
              <input
                type='radio'
                name={radioName}
                checked={active}
                onChange={() => onSelect(item.code)}
                className='h-3.5 w-3.5 accent-primary'
              />
              <span className='line-clamp-1'>{item.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export type MarketplaceLocationValue = {
  province?: string;
  district?: string;
  ward?: string;
};

type Props = {
  onChange: (v: MarketplaceLocationValue) => void;
  className?: string;
};

const INITIAL_SHOW = 15;

export function MarketplaceLocationFilters({ onChange, className }: Props) {
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogProvinceCode, setDialogProvinceCode] = useState<number | null>(
    null,
  );
  const [dialogDistrictCode, setDialogDistrictCode] = useState<number | null>(
    null,
  );
  const [dialogWardCode, setDialogWardCode] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const provincesQuery = useQuery({
    queryKey: ['vn-address', 'provinces'],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const provincesSorted = useMemo(
    () => [...(provincesQuery.data ?? [])].sort(sortVi),
    [provincesQuery.data],
  );

  const districtsQuery = useQuery({
    queryKey: ['vn-address', 'districts', provinceCode],
    queryFn: () => fetchProvinceWithDistricts(provinceCode!),
    enabled: provinceCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const districtsSorted = useMemo(
    () => [...(districtsQuery.data?.districts ?? [])].sort(sortVi),
    [districtsQuery.data],
  );

  const wardsQuery = useQuery({
    queryKey: ['vn-address', 'wards', districtCode],
    queryFn: () => fetchDistrictWithWards(districtCode!),
    enabled: districtCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const wardsSorted = useMemo(
    () => [...(wardsQuery.data?.wards ?? [])].sort(sortVi),
    [wardsQuery.data],
  );

  const dialogDistrictsQuery = useQuery({
    queryKey: ['vn-address', 'districts', dialogProvinceCode],
    queryFn: () => fetchProvinceWithDistricts(dialogProvinceCode!),
    enabled: dialogOpen && dialogProvinceCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const dialogDistrictsSorted = useMemo(
    () => [...(dialogDistrictsQuery.data?.districts ?? [])].sort(sortVi),
    [dialogDistrictsQuery.data],
  );

  const dialogWardsQuery = useQuery({
    queryKey: ['vn-address', 'wards', dialogDistrictCode],
    queryFn: () => fetchDistrictWithWards(dialogDistrictCode!),
    enabled: dialogOpen && dialogDistrictCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const dialogWardsSorted = useMemo(
    () => [...(dialogWardsQuery.data?.wards ?? [])].sort(sortVi),
    [dialogWardsQuery.data],
  );

  const filterPayload = useMemo((): MarketplaceLocationValue => {
    const province =
      provinceCode != null
        ? normalizeLocationName(
            provincesSorted.find((p) => p.code === provinceCode)?.name ?? '',
          )
        : undefined;
    const district =
      districtCode != null
        ? normalizeLocationName(
            districtsSorted.find((d) => d.code === districtCode)?.name ?? '',
          )
        : undefined;
    const ward =
      wardCode != null
        ? normalizeLocationName(
            wardsSorted.find((w) => w.code === wardCode)?.name ?? '',
          )
        : undefined;
    const out: MarketplaceLocationValue = {};
    if (province) out.province = province;
    if (district) out.district = district;
    if (ward) out.ward = ward;
    return out;
  }, [
    provinceCode,
    districtCode,
    wardCode,
    provincesSorted,
    districtsSorted,
    wardsSorted,
  ]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onChange(filterPayload);
  }, [filterPayload, onChange]);

  const filteredProvinces = useMemo(() => {
    if (!dialogSearch.trim()) return provincesSorted;
    const q = dialogSearch.toLowerCase();
    return provincesSorted.filter((p) =>
      normalizeLocationName(p.name).toLowerCase().includes(q),
    );
  }, [provincesSorted, dialogSearch]);

  const groupedProvinces = useMemo(() => {
    const groups: Record<string, ProvinceListItem[]> = {};
    for (const p of filteredProvinces) {
      const letter = normalizeLocationName(p.name)[0]?.toUpperCase() ?? '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProvinces]);

  const letters = groupedProvinces.map(([l]) => l);

  const scrollToLetter = (letter: string) => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-letter="${letter}"]`)
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const openDialog = () => {
    setDialogProvinceCode(provinceCode);
    setDialogDistrictCode(districtCode);
    setDialogWardCode(wardCode);
    setDialogSearch('');
    setDialogOpen(true);
  };

  const confirmDialog = () => {
    setProvinceCode(dialogProvinceCode);
    setDistrictCode(dialogDistrictCode);
    setWardCode(dialogWardCode);
    setDialogOpen(false);
  };

  const resetDialog = () => {
    setDialogProvinceCode(null);
    setDialogDistrictCode(null);
    setDialogWardCode(null);
  };

  const visibleProvinces = provincesSorted.slice(0, INITIAL_SHOW);
  const selectedProvinceName =
    provinceCode != null
      ? normalizeLocationName(
          provincesSorted.find((p) => p.code === provinceCode)?.name ?? '',
        )
      : null;

  return (
    <div className={cn('space-y-0', className)}>
      <div className='py-3'>
        <p className='mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
          Nơi bán
        </p>

        {provincesQuery.isLoading ? (
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Đang tải...
          </div>
        ) : (
          <div className='space-y-2'>
            {provinceCode != null &&
              !visibleProvinces.some((p) => p.code === provinceCode) && (
                <label className='flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-primary'>
                  <input
                    type='radio'
                    name='marketplace-province'
                    checked
                    onChange={() => {}}
                    onClick={() => {
                      setProvinceCode(null);
                      setDistrictCode(null);
                      setWardCode(null);
                    }}
                    className='h-3.5 w-3.5 accent-primary'
                  />
                  {selectedProvinceName}
                </label>
              )}

            {visibleProvinces.map((p) => (
              <label
                key={p.code}
                className='flex cursor-pointer select-none items-center gap-2.5 text-sm hover:text-primary'
              >
                <input
                  type='radio'
                  name='marketplace-province'
                  checked={provinceCode === p.code}
                  onChange={() => {
                    setProvinceCode(p.code);
                    setDistrictCode(null);
                    setWardCode(null);
                  }}
                  onClick={() => {
                    if (provinceCode === p.code) {
                      setProvinceCode(null);
                      setDistrictCode(null);
                      setWardCode(null);
                    }
                  }}
                  className='h-3.5 w-3.5 accent-primary'
                />
                {normalizeLocationName(p.name)}
              </label>
            ))}

            {provincesSorted.length > INITIAL_SHOW && (
              <button
                type='button'
                onClick={openDialog}
                className='text-xs text-muted-foreground hover:text-primary'
              >
                Khác &gt;
              </button>
            )}
          </div>
        )}
        {provincesQuery.isError && (
          <p className='mt-1 text-xs text-destructive'>
            Không tải được danh sách tỉnh thành.
          </p>
        )}
      </div>

      {provinceCode != null && (
        <div className='space-y-2 py-3'>
          <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'></p>
          <RadioScrollList
            radioName='sidebar-district'
            items={districtsSorted}
            selected={districtCode}
            onSelect={(code) => {
              setDistrictCode(code);
              setWardCode(null);
            }}
            loading={districtsQuery.isLoading}
            allLabel='Tất cả quận/huyện'
            maxHeight='160px'
          />

          {districtCode != null && (
            <>
              <p className='pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Phường / Xã
              </p>
              <RadioScrollList
                radioName='sidebar-ward'
                items={wardsSorted}
                selected={wardCode}
                onSelect={setWardCode}
                loading={wardsQuery.isLoading}
                allLabel='Tất cả phường/xã'
                maxHeight='160px'
              />
            </>
          )}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className='flex max-h-[70vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
          <DialogHeader className='border-b px-4 py-3'>
            <DialogTitle className='text-base'>Chọn địa điểm</DialogTitle>
          </DialogHeader>

          <div className='border-b px-4 py-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Tìm tỉnh / thành phố'
                className='h-9 pl-9 pr-8 text-sm'
                value={dialogSearch}
                onChange={(e) => setDialogSearch(e.target.value)}
                autoFocus
              />
              {dialogSearch && (
                <button
                  type='button'
                  onClick={() => setDialogSearch('')}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
          </div>

          <div className='flex min-h-0 flex-1 overflow-hidden'>
            <div
              ref={listRef}
              className='flex-1 overflow-y-auto px-4 py-2'
            >
              {groupedProvinces.length === 0 ? (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Không tìm thấy tỉnh / thành phố
                </p>
              ) : (
                groupedProvinces.map(([letter, provinces]) => (
                  <div
                    key={letter}
                    data-letter={letter}
                    className='mb-3'
                  >
                    <p className='sticky top-0 bg-background py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                      {letter}
                    </p>
                    <div className='grid grid-cols-2 gap-x-4 gap-y-0.5'>
                      {provinces.map((p) => {
                        const label = normalizeLocationName(p.name);
                        const selected = dialogProvinceCode === p.code;
                        return (
                          <label
                            key={p.code}
                            className={cn(
                              'flex cursor-pointer select-none items-center gap-2 rounded px-1 py-1.5 text-sm transition-colors hover:bg-accent/60',
                              selected && 'text-primary font-medium',
                            )}
                          >
                            <input
                              type='radio'
                              name='dialog-province'
                              checked={selected}
                              onChange={() => {
                                setDialogProvinceCode(p.code);
                                setDialogDistrictCode(null);
                                setDialogWardCode(null);
                              }}
                              onClick={() => {
                                if (selected) {
                                  setDialogProvinceCode(null);
                                  setDialogDistrictCode(null);
                                  setDialogWardCode(null);
                                }
                              }}
                              className='h-3.5 w-3.5 accent-primary'
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* District / Ward inside dialog */}
              {dialogProvinceCode != null && (
                <div className='mt-2 space-y-3 border-t pt-3'>
                  <div className='space-y-1.5'>
                    <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                      Quận / Huyện
                    </p>
                    <RadioScrollList
                      radioName='dialog-district'
                      items={dialogDistrictsSorted}
                      selected={dialogDistrictCode}
                      onSelect={(code) => {
                        setDialogDistrictCode(code);
                        setDialogWardCode(null);
                      }}
                      loading={dialogDistrictsQuery.isLoading}
                      allLabel='Tất cả quận/huyện'
                      columns={2}
                      maxHeight='176px'
                    />
                  </div>

                  {dialogDistrictCode != null && (
                    <div className='space-y-1.5'>
                      <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                        Phường / Xã
                      </p>
                      <RadioScrollList
                        radioName='dialog-ward'
                        items={dialogWardsSorted}
                        selected={dialogWardCode}
                        onSelect={setDialogWardCode}
                        loading={dialogWardsQuery.isLoading}
                        allLabel='Tất cả phường/xã'
                        columns={2}
                        maxHeight='176px'
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!dialogSearch && (
              <div className='flex w-7 shrink-0 flex-col items-center overflow-y-auto border-l border-border py-2'>
                {letters.map((l) => (
                  <button
                    key={l}
                    type='button'
                    onClick={() => scrollToLetter(l)}
                    className='w-full py-0.5 text-center text-[10px] font-semibold leading-none text-muted-foreground hover:text-primary'
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className='flex-row justify-end gap-2 border-t mb-1 mr-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={resetDialog}
            >
              Đặt lại
            </Button>
            <Button
              size='sm'
              onClick={confirmDialog}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
