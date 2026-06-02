import { supabase } from '../lib/supabase';




function mapRow(row) {
  return {
    id:            row.id,
    title:         row.title,
    description:   row.description || '',
    category:      row.category || '',
    condition:     row.condition || 'Nowy',
    mainImage:     row.main_image || null,
    images:        row.images || [],
    currentPrice:  Number(row.current_price) || 0,
    startingPrice: Number(row.starting_price) || 0,
    bidsCount:     row.bids_count || 0,
    biddersCount:  row.bidders_count || 0,
    seller: {
      name:     row.seller_name || 'Anonimowy',
      initials: row.seller_initials || 'AN',
    },
    endDate:       row.end_date ? new Date(row.end_date) : null,
    isActive:      row.is_active ?? true,
    createdBy:     row.created_by || null,
    technique:     row.technique || null,
    deliveryTime:  row.delivery_time || null,
    createdAt:     row.created_at ? new Date(row.created_at) : null,
    bids: (row.bids || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((b) => ({
        bidder: {
          name:     b.bidder_name,
          initials: b.bidder_initials || b.bidder_name?.slice(0, 2).toUpperCase() || '??',
        },
        amount:    Number(b.amount),
        timestamp: new Date(b.created_at),
      })),
  };
}




export function initializeDB() {
  
}




export async function getAllAuctions() {
  const { data, error } = await supabase
    .from('auctions')
    .select('*, bids(*)')
    .order('end_date', { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}




export async function getAuctionById(id) {
  const { data, error } = await supabase
    .from('auctions')
    .select('*, bids(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapRow(data);
}




export async function getUserAuctions(userId) {
  const { data, error } = await supabase
    .from('auctions')
    .select('*, bids(*)')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapRow);
}




export async function createAuction(auctionData, userId) {
  const endDate =
    auctionData.endDate instanceof Date
      ? auctionData.endDate.toISOString()
      : new Date(auctionData.endDate).toISOString();

  const { data, error } = await supabase
    .from('auctions')
    .insert({
      title:           auctionData.title,
      description:     auctionData.description || '',
      category:        auctionData.category || '',
      condition:       auctionData.condition || 'Nowy',
      main_image:      auctionData.mainImage || null,
      images:          auctionData.images || [],
      current_price:   Number(auctionData.startingPrice) || 0,
      starting_price:  Number(auctionData.startingPrice) || 0,
      bids_count:      0,
      bidders_count:   0,
      seller_name:     auctionData.seller?.name || 'Ty',
      seller_initials: auctionData.seller?.initials || 'TY',
      end_date:        endDate,
      is_active:       true,
      created_by:      userId,
      technique:       auctionData.technique || null,
      delivery_time:   auctionData.deliveryTime || null,
    })
    .select('*, bids(*)')
    .single();

  if (error) throw error;
  return mapRow(data);
}




export async function placeBid(auctionId, bidderName, amount) {
  const initials = bidderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  
  const { error: bidError } = await supabase.from('bids').insert({
    auction_id:      auctionId,
    bidder_name:     bidderName,
    bidder_initials: initials,
    amount:          Number(amount),
  });
  if (bidError) throw bidError;

  
  const { error: updateError } = await supabase.rpc('place_bid_update', {
    p_auction_id: auctionId,
    p_amount:     Number(amount),
  });

  
  if (updateError) {
    await supabase
      .from('auctions')
      .update({ current_price: Number(amount) })
      .eq('id', auctionId);
  }

  
  return getAuctionById(auctionId);
}




export async function searchAuctions(query) {
  const { data, error } = await supabase
    .from('auctions')
    .select('*, bids(*)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) throw error;
  return data.map(mapRow);
}




export async function filterByCategory(category) {
  if (!category || category === 'All Items') return getAllAuctions();

  const { data, error } = await supabase
    .from('auctions')
    .select('*, bids(*)')
    .eq('category', category)
    .order('end_date', { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}




export async function closeAuction(id) {
  const { error } = await supabase
    .from('auctions')
    .update({ is_active: false, end_date: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}




export async function deleteAuction(id) {
  const { error } = await supabase
    .from('auctions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
