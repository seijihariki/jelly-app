import { HeartFillIcon, HeartIcon } from '@primer/octicons-react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { JellyImg } from '../components/JellyImg'
import { Loader } from '../components/Loader'
import { PlaylistTrackList } from '../components/PlaylistTrackList'
import { MoreIcon } from '../components/SvgIcons'
import { useDropdownContext } from '../context/DropdownContext/DropdownContext'
import { usePageTitle } from '../context/PageTitleContext/PageTitleContext'
import { usePlaybackContext } from '../context/PlaybackContext/PlaybackContext'
import { useJellyfinPlaylistData } from '../hooks/Jellyfin/Infinite/useJellyfinPlaylistData'
import { useFavorites } from '../hooks/useFavorites'
import { formatDate } from '../utils/formatDate'
import { formatDurationReadable } from '../utils/formatDurationReadable'
import './Playlist.css'

export const Playlist = () => {
    const playback = usePlaybackContext()
    const { addToFavorites, removeFromFavorites } = useFavorites()

    const { playlistId } = useParams<{ playlistId: string }>()
    const {
        playlist,
        items: tracks,
        isLoading,
        error,
        totalPlaytime,
        totalTrackCount,
        totalPlays,
        reviver,
        loadMore,
    } = useJellyfinPlaylistData(playlistId!)

    const { setPageTitle } = usePageTitle()
    const { isOpen, selectedItem, onContextMenu } = useDropdownContext()

    useEffect(() => {
        if (playlist) {
            setPageTitle(playlist.Name)
        }
        return () => {
            setPageTitle('')
        }
    }, [playlist, setPageTitle])

    if (isLoading && tracks.length === 0) {
        return <Loader />
    }

    if (error || !playlist) {
        return <div className="error">{error || 'Playlist not found'}</div>
    }

    const handleMoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        onContextMenu(e, { item: playlist }, true, { add_to_favorite: true, remove_from_favorite: true })
    }

    return (
        <div className="playlist-page">
            <div className="playlist-header">
                <JellyImg item={playlist} type={'Primary'} width={100} height={100} />

                <div className="playlist-details">
                    <div className="title">{playlist.Name}</div>
                    <div className="date">{formatDate(playlist.DateCreated)}</div>
                    <div className="stats">
                        <div className="track-amount">
                            <span className="number">{totalTrackCount}</span>{' '}
                            <span>{totalTrackCount === 1 ? 'Track' : 'Tracks'}</span>
                        </div>
                        <div className="divider"></div>
                        <div className="length">
                            <span className="number">{formatDurationReadable(totalPlaytime)}</span> <span>Total</span>
                        </div>
                        {totalPlays > 0 && (
                            <>
                                <div className="divider"></div>
                                <div className="plays">
                                    <span className="number">{totalPlays}</span> {totalPlays === 1 ? 'Play' : 'Plays'}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="actions noSelect">
                        <div className="primary">
                            <div
                                className="play-playlist"
                                onClick={() => {
                                    playback.setCurrentPlaylist({ playlist: tracks, title: playlist.Name })
                                    playback.playTrack(0)
                                }}
                            >
                                <div className="play-icon" />
                                <div className="text">Play</div>
                            </div>
                            <div
                                className="favorite-state"
                                title={playlist.UserData?.IsFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                onClick={async () => {
                                    if (playlist?.Id) {
                                        try {
                                            if (playlist.UserData?.IsFavorite) {
                                                await removeFromFavorites(playlist)
                                            } else {
                                                await addToFavorites(playlist)
                                            }
                                        } catch (error) {
                                            console.error('Failed to update favorite status:', error)
                                        }
                                    }
                                }}
                            >
                                {playlist.UserData?.IsFavorite ? <HeartFillIcon size={16} /> : <HeartIcon size={16} />}
                            </div>
                        </div>
                        <div
                            className={`more ${isOpen && selectedItem?.Id === playlist?.Id ? 'active' : ''}`}
                            onClick={handleMoreClick}
                            title="More"
                        >
                            <MoreIcon width={14} height={14} />
                        </div>
                    </div>
                </div>
            </div>

            <PlaylistTrackList
                tracks={tracks}
                isLoading={isLoading}
                showType="artist"
                playlistId={playlistId}
                title={playlist ? playlist.Name : 'Playlist'}
                reviver={reviver}
                loadMore={loadMore}
            />
        </div>
    )
}
