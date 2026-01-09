export const AudioVisualizer = ({ isRecording }: { isRecording: boolean }) => {
    return (
        <div className="h-12 flex items-center justify-center gap-1">
            {isRecording ? (
                Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-1 bg-primary/60 rounded-full animate-pulse"
                        style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: '0.5s'
                        }}
                    />
                ))
            ) : (
                <div className="text-muted-foreground text-sm">Микрофон выключен</div>
            )}
        </div>
    )
}
