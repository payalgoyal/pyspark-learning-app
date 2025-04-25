
export default function HintBox ({hintTrigger , hint}) {
    return(
        <div>
            {hintTrigger && (
                <div>
                    <h4>Hint:</h4>
                    <p>{hint}</p>
                </div>
            )}
        </div>
    )
}
