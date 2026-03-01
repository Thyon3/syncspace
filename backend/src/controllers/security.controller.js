import Session from '../model/session.model.js';

export const getSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const sessions = await Session.find({ userId }).sort({ lastActive: -1 });

        // Mark the current session
        const processedSessions = sessions.map(s => ({
            ...s.toObject(),
            isCurrent: s.token === (req.cookies?.userJwt || req.headers.authorization?.split(' ')[1])
        }));

        res.json(processedSessions);
    } catch (error) {
        console.error("Error in getSessions:", error);
        res.status(500).json({ message: error.message });
    }
};

export const terminateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Cannot terminate current session via this endpoint (usually logout is used)
        const currentToken = req.cookies?.userJwt || req.headers.authorization?.split(' ')[1];
        if (session.token === currentToken) {
            return res.status(400).json({ message: "Use logout to terminate current session" });
        }

        await Session.findByIdAndDelete(sessionId);
        res.json({ message: "Session terminated successfully" });
    } catch (error) {
        console.error("Error in terminateSession:", error);
        res.status(500).json({ message: error.message });
    }
};

export const terminateOtherSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentToken = req.cookies?.userJwt || req.headers.authorization?.split(' ')[1];

        if (!currentToken) {
            return res.status(401).json({ message: "Current session not identified" });
        }

        const result = await Session.deleteMany({
            userId,
            token: { $ne: currentToken }
        });

        res.json({
            message: "All other sessions terminated successfully",
            count: result.deletedCount
        });
    } catch (error) {
        console.error("Error in terminateOtherSessions:", error);
        res.status(500).json({ message: error.message });
    }
};
